import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PendingUser, PendingUserDocument } from './schemas/pending-user.schema';

@Injectable()
export class PendingUsersService {
    constructor(@InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUserDocument>) {}

    async create(username: string, hashedPassword: string, email: string, role: string = 'user', isEmailVerified: boolean = false): Promise<PendingUserDocument> {
        const newPendingUser = new this.pendingUserModel({
            username,
            password: hashedPassword,
            email,
            role,
            isEmailVerified,
        });
        return newPendingUser.save();
    }

    async findById(id: string): Promise<PendingUserDocument | null> {
        const userId = new Types.ObjectId(id);
        return this.pendingUserModel.findById(userId).exec();
    }

    async findByUsername(username: string): Promise<PendingUserDocument | null> {
        return this.pendingUserModel.findOne({ username }).exec();
    }

    async delete(id: string): Promise<void> {
        const userId = new Types.ObjectId(id);
        const result = await this.pendingUserModel.deleteOne({ _id: userId }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Pending user not found');
        }
    }
    async createPendingUser(
        username: string,
        password: string,
        email: string,
        role: string,
    ): Promise<PendingUserDocument> {
        const newPendingUser = new this.pendingUserModel({
            username,
            password,
            email,
            role,
            isEmailVerified: false,
        });
        return newPendingUser.save();
    }

    async findPendingUserById(id: string): Promise<PendingUserDocument | null> {
        const userId = new Types.ObjectId(id);
        return this.pendingUserModel.findById(userId).exec();
    }
}