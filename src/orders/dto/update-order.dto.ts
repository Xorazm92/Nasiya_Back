import { IsString, IsNumber, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schemas/order.schema';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  customer?: string;
  
  @IsOptional()
  @IsString()
  product?: string;
  
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
  
  @IsOptional()
  @IsNumber()
  total?: number;
  
  @IsOptional()
  @IsEnum(['Completed', 'Processing', 'Pending Payment', 'Cancelled'])
  status?: OrderStatus;
}