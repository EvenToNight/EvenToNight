import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<any>) {}

  async upsertUser(data: {
    userId: string;
    name?: string;
    avatar?: string;
  }): Promise<User> {
    return this.userModel.findOneAndUpdate({ userId: data.userId }, data, {
      upsert: true,
      new: true,
    });
  }

  async updateUser(
    userId: string,
    updates: { name?: string; avatar?: string },
  ): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true },
    );
  }
}
