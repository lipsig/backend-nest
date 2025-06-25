import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsPositive, Min, Max, IsUrl } from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean = true;

  @IsNumber()
  @IsOptional()
  @Min(0)
  preparationTime?: number = 0;

  @IsString()
  @IsOptional()
  ingredients?: string;

  @IsString()
  @IsOptional()
  allergens?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  calories?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reviewCount?: number = 0;

  @IsString()
  @IsOptional()
  storeId?: string;
}
