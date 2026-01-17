import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from 'src/tickets/domain/repositories/user.repository.interface';
import { UserDocument } from '../schemas/user.schema';
import { UserMapper } from '../mappers/user.mapper';
import { User } from 'src/tickets/domain/aggregates/user.aggregate';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<User> {
    const document = UserMapper.toPersistence(user);
    const created = new this.userModel(document);
    const saved = await created.save();
    return UserMapper.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();
    return document ? UserMapper.toDomain(document) : null;
  }

  async update(user: User): Promise<User> {
    const document = UserMapper.toPersistence(user);
    const updated = await this.userModel
      .findByIdAndUpdate(user.getId(), document, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`User with id ${user.getId().toString()} not found`);
    }

    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
