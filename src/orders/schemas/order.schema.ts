import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OrderStatus = 'Completed' | 'Processing' | 'Pending Payment' | 'Cancelled';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  customer: string;
  
  @Prop({ required: true })
  product: string;
  
  @Prop({ required: true })
  date: Date;
  
  @Prop({ required: true, type: Number })
  total: number;
  
  @Prop({ 
    required: true, 
    enum: ['Completed', 'Processing', 'Pending Payment', 'Cancelled'],
    default: 'Processing'
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);