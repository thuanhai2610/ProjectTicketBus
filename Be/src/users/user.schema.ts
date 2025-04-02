import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document{
    @Prop({required: true, unique : true})
    username: string;

    @Prop({required: true})
    password: string;

    @Prop({required: true, default: 'user'})
    role: string;

    @Prop({ default: false })
    isEmailVerified: boolean;

  @Prop({ required: true, unique: true }) // Thêm trường email
  email: string;

}
export const UserSchema = SchemaFactory.createForClass(User)