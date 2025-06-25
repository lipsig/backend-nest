import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  description: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Preço deve ser um número válido' })
  @IsPositive({ message: 'Preço deve ser positivo' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  category: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  available?: boolean = true;

  @Transform(({ value }) => value ? parseInt(value) : 0)
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

  @Transform(({ value }) => value ? parseInt(value) : 0)
  @IsNumber({}, { message: 'Calorias deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Calorias não pode ser negativo' })
  calories?: number = 0;

  @Transform(({ value }) => value ? parseFloat(value) : 0)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Rating deve ser um número válido' })
  @IsOptional()
  @Min(0, { message: 'Rating mínimo é 0' })
  @Max(5, { message: 'Rating máximo é 5' })
  rating?: number = 0;

  @Transform(({ value }) => value ? parseInt(value) : 0)
  @IsNumber({}, { message: 'Número de avaliações deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Número de avaliações não pode ser negativo' })
  reviewCount?: number = 0;

  @IsString()
  @IsOptional()
  storeId?: string;
}
