import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  Query,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ProdutosService } from './produtos.service';
import { memoryStorage } from 'multer';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Apenas arquivos de imagem são permitidos'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async create(
    @Body() createProdutoDto: CreateProdutoDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    const produto = await this.produtosService.create(createProdutoDto, image);
    return {
      message: 'Produto criado com sucesso',
      data: produto
    };
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.produtosService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Apenas arquivos de imagem são permitidos'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async update(
    @Param('id') id: string, 
    @Body() updateProdutoDto: UpdateProdutoDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    const produto = await this.produtosService.update(id, updateProdutoDto, image);
    return {
      message: 'Produto atualizado com sucesso',
      data: produto
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produtosService.remove(id);
  }
}
