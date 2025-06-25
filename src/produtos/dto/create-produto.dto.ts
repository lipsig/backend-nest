import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsPositive, Min, Max } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Preço deve ser um número válido' })
  @IsPositive({ message: 'Preço deve ser positivo' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  category: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean = true;

  @IsNumber({}, { message: 'Tempo de preparo deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Tempo de preparo não pode ser negativo' })
  preparationTime?: number = 0;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsString()
  @IsOptional()
  allergens?: string;

  @IsNumber({}, { message: 'Calorias deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Calorias não pode ser negativo' })
  calories?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Rating deve ser um número válido' })
  @IsOptional()
  @Min(0, { message: 'Rating mínimo é 0' })
  @Max(5, { message: 'Rating máximo é 5' })
  rating?: number = 0;

  @IsNumber({}, { message: 'Número de avaliações deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Número de avaliações não pode ser negativo' })
  reviewCount?: number = 0;

  @IsString()
  @IsOptional()
  storeId?: string;
}
  