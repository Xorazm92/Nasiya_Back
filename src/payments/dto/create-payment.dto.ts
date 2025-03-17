import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../schemas/payment.schema';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
  
  @IsNotEmpty()
  @IsString()
  customer: string;
  
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
  
  @IsNotEmpty()
  @IsString()
  method: string;
  
  @IsOptional()
  @IsEnum(['Completed', 'Processing', 'Failed'])
  status?: PaymentStatus;
}