import { IsString, IsNumber, IsEnum, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../schemas/payment.schema';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  orderId?: string;
  
  @IsOptional()
  @IsString()
  customer?: string;
  
  @IsOptional()
  @IsNumber()
  amount?: number;
  
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
  
  @IsOptional()
  @IsString()
  method?: string;
  
  @IsOptional()
  @IsEnum(['Completed', 'Processing', 'Failed'])
  status?: PaymentStatus;
}