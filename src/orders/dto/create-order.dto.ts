import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customer: string;
  
  @IsNotEmpty()
  @IsString()
  product: string;
  
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
  
  @IsNotEmpty()
  @IsNumber()
  total: number;
  
  @IsOptional()
  @IsEnum(['Completed', 'Processing', 'Pending Payment', 'Cancelled'])
  status?: OrderStatus;
}