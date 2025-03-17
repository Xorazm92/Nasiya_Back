import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentStatus = 'Completed' | 'Processing' | 'Failed';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  orderId: string;
  
  @Prop({ required: true })
  customer: string;
  
  @Prop({ required: true, type: Number })
  amount: number;
  
  @Prop({ required: true })
  date: Date;
  
  @Prop({ required: true })
  method: string;
  
  @Prop({ 
    required: true, 
    enum: ['Completed', 'Processing', 'Failed'],
    default: 'Processing'
  })
  status: PaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);