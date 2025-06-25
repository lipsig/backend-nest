import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto } from './schemas/produto.schema';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import slugify from 'slugify';

@Injectable()
export class ProdutosService {
  constructor(@InjectModel(Produto.name) private produtoModel: Model<Produto>) {}

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const slug = slugify(createProdutoDto.name, { lower: true });
    const createdProduto = new this.produtoModel({
      ...createProdutoDto,
      slug,
    });
    return createdProduto.save();
  }

  async findAll(): Promise<Produto[]> {
    return this.produtoModel.find().exec();
  }

  async findOne(id: string): Promise<Produto> {
    const produto = await this.produtoModel.findById(id).exec();
    if (!produto) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    const updatedData: any = { ...updateProdutoDto };

    if (updateProdutoDto.name) {
      updatedData.slug = slugify(updateProdutoDto.name, { lower: true });
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
    const result = await this.produtoModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produto #${id} não encontrado`);
    }
  }
}
