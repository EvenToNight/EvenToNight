import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<any>) {}

  async upsertUser(data: {
    userId: string;
    userRole: UserRole;
    name: string;
    avatar: string;
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

  async deleteUser(userId: string): Promise<void> {
    await this.userModel.deleteOne({ userId });
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userModel.findOne({ userId });
    console.log('Checking if user exists:', userId, !!user);
    // TODO: Implement check properly
    //return !!user;
    return true;
  }

  async getUserInfo(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId });
  }

  async getUsername(userId: string): Promise<string | null> {
    const user = await this.userModel.findOne({ userId }).select('name').exec();
    return user ? user.name : null;
  }

  async searchUsers(query: any): Promise<User[]> {
    return this.userModel.find(query).exec();
  }
}
