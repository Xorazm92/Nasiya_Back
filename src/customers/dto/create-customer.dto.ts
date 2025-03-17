import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsString()
  phone: string;
  
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsNumber()
  totalOrders?: number;
  
  @IsOptional()
  @IsNumber()
  totalSpent?: number;
}