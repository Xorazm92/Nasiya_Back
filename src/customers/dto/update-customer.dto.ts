import { IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsNumber()
  totalOrders?: number;
  
  @IsOptional()
  @IsNumber()
  totalSpent?: number;
}