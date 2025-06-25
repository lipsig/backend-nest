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
    const slug = slugify(createProdutoDto.name, { lower: true });
    
    let imageUrl = '';
    if (imageFile) {
      imageUrl = await this.processAndSaveImage(imageFile);
    }

    const createdProduto = new this.produtoModel({
      ...createProdutoDto,
      slug,
      image: imageUrl,
    });
    return createdProduto.save();
  }

  async findAll(paginationDto?: PaginationDto): Promise<{ produtos: Produto[]; total: number; pages: number }> {
    const { page = 1, limit = 10, category, available, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto || {};
    
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (category) query.category = category;
    if (available !== undefined) query.available = available;

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
    
    const updatedData: any = { ...updateProdutoDto };

    if (updateProdutoDto.name) {
      updatedData.slug = slugify(updateProdutoDto.name, { lower: true });
    }

    if (imageFile) {
      // Remove imagem antiga se existir
      if (existingProduto.image) {
        await this.removeImage(existingProduto.image);
      }
      updatedData.image = await this.processAndSaveImage(imageFile);
    }

    const updatedProduto = await this.produtoModel
      .findByIdAndUpdate(id, updatedData, { new: true })
      .exec();

    if (!updatedProduto) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }

    return updatedProduto;
  }

  async remove(id: string): Promise<void> {
    const produto = await this.findOne(id);
    
    // Remove imagem se existir
    if (produto.image) {
      await this.removeImage(produto.image);
    }

    const result = await this.produtoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
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
      // Log error but don't throw - image might not exist
      console.warn(`Não foi possível remover imagem: ${imageUrl}`);
    }
  }
}
