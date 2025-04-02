import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the User interface with a typed _id
export interface User {
    _id: Types.ObjectId; // Explicitly type _id as Types.ObjectId
    username: string;
    password: string;
    email: string;
    role: string;
    emailVerified: boolean;
}

@Schema()
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true, default: 'user' })
    role: string;

    @Prop({ required: true, default: false })
    emailVerified: boolean;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);