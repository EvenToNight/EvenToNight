import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<any>) {}

  async upsertUser(data: {
    id: string;
    role: UserRole;
    name: string;
    avatar: string;
  }): Promise<User> {
    return this.userModel.findOneAndUpdate({ id: data.id }, data, {
      upsert: true,
      new: true,
    });
  }

  async updateUser(
    id: string,
    updates: { name?: string; avatar?: string },
  ): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true },
    );
  }

  async deleteUser(id: string): Promise<void> {
    await this.userModel.deleteOne({ id });
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.userModel.findOne({ id });
    console.log('Checking if user exists:', id, !!user);
    return !!user;
  }

  async getUserInfo(id: string): Promise<User | null> {
    return this.userModel.findOne({ id });
  }

  async getUsername(id: string): Promise<string | null> {
    const user = await this.userModel.findOne({ id }).select('name').exec();
    return user ? user.name : null;
  }

  async searchUsers(query: any): Promise<User[]> {
    return this.userModel.find(query).exec();
  }
}
