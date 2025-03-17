import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;
  
  @IsNumber()
  @Min(0)
  price: number;
  
  @IsNumber()
  @Min(0)
  stock: number;
  
  @IsString()
  category: string;
  
  @IsOptional()
  @IsString()
  image?: string;
}