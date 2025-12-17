import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../schemas/like.schema';

@Injectable()
export class LikeService {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async likeEvent(eventId: string, userId: string): Promise<Like> {
    const existing = await this.likeModel.findOne({ eventId, userId });
    if (existing) {
      throw new ConflictException('Already liked this event');
    }

    const like = new this.likeModel({ eventId, userId });
    return like.save();
  }

  async unlikeEvent(eventId: string, userId: string): Promise<void> {
    const result = await this.likeModel.deleteOne({ eventId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }
  }
}
