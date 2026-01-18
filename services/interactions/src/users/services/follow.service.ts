import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from '../schemas/follow.schema';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginatedUserResponseDto } from '../dto/paginated-user-response.dto';
import { MetadataService } from 'src/metadata/services/metadata.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
  ) {}

  async follow(followerId: string, followedId: string): Promise<Follow> {
    await this.metadataService.validateFollowAllowed(followerId, followedId);

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
    await this.metadataService.validateUnfollowAllowed(followerId, followedId);
    const result = await this.followModel.deleteOne({ followerId, followedId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Follow relationship not found');
    }
  }

  async getFollowers(userId: string, limit?: number, offset?: number) {
    await this.metadataService.validateUserExistence(userId);
    let query = this.followModel
      .find({ followedId: userId })
      .select({ _id: 0, followerId: 1, followedId: 1 });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);

    const [items, total] = await Promise.all([
      query.exec(),
      this.followModel.countDocuments({ followedId: userId }),
    ]);

    return new PaginatedResponseDto(
      items.map((f) => f.followerId),
      total,
      limit ?? total,
      offset ?? 0,
    );
  }

  async getFollowing(userId: string, limit?: number, offset?: number) {
    await this.metadataService.validateUserExistence(userId);
    let query = this.followModel
      .find({ followerId: userId })
      .select({ _id: 0, followerId: 1, followedId: 1 });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);

    const [items, total] = await Promise.all([
      query.exec(),
      this.followModel.countDocuments({ followerId: userId }),
    ]);

    return new PaginatedResponseDto(
      items.map((f) => f.followedId),
      total,
      limit ?? total,
      offset ?? 0,
    );
  }

  async getUserFollowsInteraction(userId: string) {
    await this.metadataService.validateUserExistence(userId);
    const [followersData, followingData] = await Promise.all([
      this.getFollowers(userId, undefined, undefined),
      this.getFollowing(userId, undefined, undefined),
    ]);
    return new PaginatedUserResponseDto(
      followersData.items,
      followersData.totalItems,
      followingData.items,
      followingData.totalItems,
    );
  }

  async deleteUser(userId: string) {
    await this.metadataService.validateUserExistence(userId);
    await this.followModel.deleteMany({
      $or: [{ followerId: userId }, { followedId: userId }],
    });
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    await this.metadataService.validateUserExistence(followerId);
    await this.metadataService.validateUserExistence(followedId);
    const follow = await this.followModel.findOne({ followerId, followedId });
    return !!follow;
  }
}
