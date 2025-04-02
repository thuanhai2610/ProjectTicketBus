import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "./user.schema";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model <UserDocument>) {}
        async findOne(username: string): Promise<UserDocument | null> {
               return this.userModel.findOne({username}).exec();
        }
        async hashedPassword(password: string): Promise<string> {
            return bcrypt.hash(password, 10);
        }
        async create(username: string, hashedPassword: string, email: string, role: string = 'user', isEmailVerified: boolean = false): Promise<UserDocument> {
            const newUser = new this.userModel({
                username,
                password: hashedPassword, 
                email,
                role,
                isEmailVerified,
            });
            return newUser.save();
        }
        async findById(id: string): Promise<UserDocument | null> {
            const userId = new Types.ObjectId(id);
            return this.userModel.findById(userId).exec();
        }
          async validateUser(username: string, password: string): Promise<UserDocument| null> {
            const user = await this.userModel
                .findOne({ username })
                .select('username password email role emailVerified')
                .exec();
            if (user && (await bcrypt.compare(password, user.password))) {
                return user;
            }
            return null;
        }
        async updateEmailVerified(userId: string, isEmailVerified: boolean): Promise<void> {
            const userIdObject = new Types.ObjectId(userId);
            await this.userModel.updateOne({ _id: userIdObject }, { isEmailVerified }).exec();
        }
          async delete(userId: string): Promise<void> {
            const result = await this.userModel.deleteOne({ _id: userId }).exec();
            if (result.deletedCount === 0) {
                throw new NotFoundException('User not found');
            }
        }
        async findByEmail(email: string): Promise<UserDocument | null> {
            return this.userModel.findOne({ email }).exec();
        }
        async updatePassword(userId: string, newPassword: string): Promise<void> {
            const userIdObject = new Types.ObjectId(userId);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await this.userModel
                .updateOne({ _id: userIdObject }, { password: hashedPassword })
                .exec();
            if (result.matchedCount === 0) {
                throw new NotFoundException('User not found');
            }
        }
}