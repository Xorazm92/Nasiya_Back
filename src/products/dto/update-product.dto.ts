import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
  
  @IsOptional()
  @IsString()
  category?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
}