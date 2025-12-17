import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from '../common/schemas/follow.schema';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PaginatedResponseDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class FollowService {
  constructor(@InjectModel(Follow.name) private followModel: Model<Follow>) {}

  async follow(followerId: string, followedId: string): Promise<Follow> {
    if (followerId === followedId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const existing = await this.followModel.findOne({ followerId, followedId });
    if (existing) {
      throw new ConflictException('Already following this user');
    }

    const follow = new this.followModel({ followerId, followedId });
    return follow.save();
  }

  async unfollow(followerId: string, followedId: string) {
    const result = await this.followModel.deleteOne({ followerId, followedId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Follow relationship not found');
    }
  }

  async getFollowers(
    userId: string,
    limit: number | undefined,
    offset: number | undefined,
  ): Promise<PaginatedResponseDto<Follow>> {
    let query = this.followModel
      .find({ followedId: userId })
      .select({ _id: 0, followerId: 1, followedId: 1 });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);

    const [items, total] = await Promise.all([
      query.exec(),
      this.followModel.countDocuments({ followedId: userId }),
    ]);

    return new PaginatedResponseDto(items, total, limit ?? total, offset ?? 0);
  }

  async getFollowing(
    userId: string,
    limit: number | undefined,
    offset: number | undefined,
  ): Promise<PaginatedResponseDto<Follow>> {
    let query = this.followModel
      .find({ followerId: userId })
      .select({ _id: 0, followerId: 1, followedId: 1 });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);

    const [items, total] = await Promise.all([
      query.exec(),
      this.followModel.countDocuments({ followerId: userId }),
    ]);

    return new PaginatedResponseDto(items, total, limit ?? total, offset ?? 0);
  }
}
