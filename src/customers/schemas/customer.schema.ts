import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  phone: string;
  
  @Prop({ required: true })
  email: string;
  
  @Prop({ default: 0 })
  totalOrders: number;
  
  @Prop({ default: 0 })
  totalSpent: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);