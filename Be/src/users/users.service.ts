import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "./user.schema";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model <User>) {}
        async findOne(username: string): Promise<User | null> {
               return this.userModel.findOne({username}).exec();
        }
     
        async create(username: string, password: string, email:string,role: string = 'user', isEmailVerified:boolean=false): Promise<User>{
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = new this.userModel({username, password: hashedPassword,email, role,isEmailVerified});
            return newUser.save();

        }
        async findById(id: string): Promise<User | null> {
            const userId = new Types.ObjectId(id);
            return this.userModel.findById(userId).exec();
        }
          async validateUser(username: string, password: string): Promise<User| null> {
            const user = await this.userModel
                .findOne({ username })
                .select('username password email role emailVerified')
                .exec();
            if (user && (await bcrypt.compare(password, user.password))) {
                return user;
            }
            return null;
        }
        async updateEmailVerified(userId: string, emailVerified: boolean): Promise<void> {
            const userIdObject = new Types.ObjectId(userId);
            await this.userModel.updateOne({ _id: userIdObject }, { emailVerified }).exec();
        }
          async delete(userId: string): Promise<void> {
            const result = await this.userModel.deleteOne({ _id: userId }).exec();
            if (result.deletedCount === 0) {
                throw new NotFoundException('User not found');
            }
        }

}