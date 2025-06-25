import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto } from './schemas/produto.schema';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { PaginationDto } from './dto/pagination.dto';
import slugify from 'slugify';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharp from 'sharp';

@Injectable()
export class ProdutosService {
  constructor(@InjectModel(Produto.name) private produtoModel: Model<Produto>) {}

  async create(createProdutoDto: CreateProdutoDto, imageFile?: Express.Multer.File): Promise<Produto> {
    // Verificar se já existe produto com o mesmo nome na mesma loja
    await this.checkDuplicateName(createProdutoDto.name, createProdutoDto.storeId);
    
    const slug = await this.generateUniqueSlug(createProdutoDto.name, createProdutoDto.storeId);
    
    let imageUrl = '';
    if (imageFile) {
      imageUrl = await this.processAndSaveImage(imageFile);
    }

    try {
      const createdProduto = new this.produtoModel({
        ...createProdutoDto,
        slug,
        image: imageUrl,
      });
      return createdProduto.save();
    } catch (error) {
      // Se a imagem foi processada mas houve erro ao salvar, remover a imagem
      if (imageUrl) {
        await this.removeImage(imageUrl);
      }
      
      // Verificar se é erro de duplicata
      if (error.code === 11000) {
        throw new BadRequestException('Já existe um produto com esse nome nesta loja');
      }
      
      throw error;
    }
  }

  async findAll(paginationDto?: PaginationDto): Promise<{ produtos: Produto[]; total: number; pages: number }> {
    const { page = 1, limit = 10, category, available, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (category) query.category = category.toLowerCase();
    if (available !== undefined) {

      let isAvailable: boolean;
      if (typeof available === 'string') {
        isAvailable = (available as string).toLowerCase() === 'true';
      } else if (typeof available === 'boolean') {
        isAvailable = available;
      } else {
        isAvailable = Boolean(available);
      }
      query.available = isAvailable;
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [produtos, total] = await Promise.all([
      this.produtoModel.find(query).sort(sortOptions).skip(skip).limit(limit).exec(),
      this.produtoModel.countDocuments(query).exec(),
    ]);

    const pages = Math.ceil(total / limit);

    return { produtos, total, pages };
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtoModel.findById(id).exec();
    if (!produto) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto, imageFile?: Express.Multer.File): Promise<Produto> {
    const existingProduto = await this.findOne(id);
    
    // Se o nome está sendo alterado, verificar duplicatas
    if (updateProdutoDto.name && updateProdutoDto.name !== existingProduto.name) {
      await this.checkDuplicateName(
        updateProdutoDto.name, 
        updateProdutoDto.storeId || existingProduto.storeId,
        id
      );
    }
    
    const updatedData: any = { ...updateProdutoDto };

    if (updateProdutoDto.name) {
      updatedData.slug = await this.generateUniqueSlug(
        updateProdutoDto.name, 
        updateProdutoDto.storeId || existingProduto.storeId,
        id
      );
    }

    if (imageFile) {
      // Remove imagem antiga se existir
      if (existingProduto.image) {
        await this.removeImage(existingProduto.image);
      }
      updatedData.image = await this.processAndSaveImage(imageFile);
    }

    try {
      const updatedProduto = await this.produtoModel
        .findByIdAndUpdate(id, updatedData, { new: true })
        .exec();

      if (!updatedProduto) {
        throw new NotFoundException(`Produto #${id} não encontrado`);
      }

      return updatedProduto;
    } catch (error) {
      // Se uma nova imagem foi processada mas houve erro ao salvar, remover a nova imagem
      if (imageFile && updatedData.image) {
        await this.removeImage(updatedData.image);
      }
      
      // Verificar se é erro de duplicata
      if (error.code === 11000) {
        throw new BadRequestException('Já existe um produto com esse nome nesta loja');
      }
      
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    // Verificar se o item existe antes de remover
    const produto = await this.findOne(id);
    
    // Remove imagem se existir
    if (produto.image) {
      await this.removeImage(produto.image);
    }

    const result = await this.produtoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produto #${id} não encontrado para remoção`);
    }

    return { message: `Produto "${produto.name}" removido com sucesso` };
  }

  private async processAndSaveImage(file: Express.Multer.File): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
      const filepath = path.join(uploadDir, filename);

      // Processar imagem: redimensionar para 400x400 (1:1) e otimizar
      await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(filepath);

      return `/uploads/${filename}`;
    } catch (error) {
      throw new BadRequestException('Erro ao processar imagem');
    }
  }

  private async removeImage(imageUrl: string): Promise<void> {
    try {
      const filename = path.basename(imageUrl);
      const filepath = path.join(process.cwd(), 'uploads', filename);
      await fs.unlink(filepath);
    } catch (error) {
      console.warn(`Não foi possível remover imagem: ${imageUrl}`);
    }
  }

  private async generateUniqueSlug(name: string, storeId?: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, storeId, excludeId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async slugExists(slug: string, storeId?: string, excludeId?: string): Promise<boolean> {
    const query: any = { slug };
    
    if (storeId) {
      query.storeId = storeId;
    } else {
      query.$or = [
        { storeId: { $exists: false } },
        { storeId: null }
      ];
    }
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.produtoModel.findOne(query).exec();
    return !!existing;
  }

  private async checkDuplicateName(name: string, storeId?: string, excludeId?: string): Promise<void> {
    const query: any = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    
    // Se tem storeId, verificar apenas dentro da mesma loja
    if (storeId) {
      query.storeId = storeId;
    } else {
      // Se não tem storeId, verificar apenas produtos sem storeId
      query.$or = [
        { storeId: { $exists: false } },
        { storeId: null }
      ];
    }
    
    // Excluir o produto atual se for uma atualização
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingProduto = await this.produtoModel.findOne(query).exec();
    
    if (existingProduto) {
      if (storeId) {
        throw new BadRequestException('Já existe um produto com esse nome nesta loja');
      } else {
        throw new BadRequestException('Já existe um produto com esse nome');
      }
    }
  }
}
