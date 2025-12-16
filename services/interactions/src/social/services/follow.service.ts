import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from '../model/schemas/follow.schema';
import { Model } from 'mongoose';
import { CreateFollowDto } from '../model/dto/create-follow.dto';
import { DeleteFollowDto } from '../model/dto/delete-follow.dto';
import { ConflictException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FollowService {
  constructor(@InjectModel(Follow.name) private followModel: Model<Follow>) {}

  async follow(createFollowDto: CreateFollowDto) {
    const { followerId, followedId } = createFollowDto;
    if (followerId === followedId) {
      throw new ConflictException('Cannot follow yourself');
    }
    const existing = await this.followModel.findOne({ followerId, followedId });
    if (existing) {
      throw new ConflictException('Already following this user');
    }
    const follow = new this.followModel(createFollowDto);
    return follow.save();
  }

  async unfollow(deleteFollowDto: DeleteFollowDto) {
    const { followerId, followedId } = deleteFollowDto;
    const result = await this.followModel.deleteOne({ followerId, followedId });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Follow relationship not found');
    }
  }
}
