import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;
  
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  password: string;
  
  @Prop({ required: true, default: 'user' })
  role: string;
  
  @Prop()
  initials: string;
}

export const UserSchema = SchemaFactory.createForClass(User);