import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../schemas/like.schema';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

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

  async getEventLikes(
    eventId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<string>> {
    let query = this.likeModel.find({ eventId });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);
    const [items, total] = await Promise.all([
      query.exec(),
      this.likeModel.countDocuments({ eventId }),
    ]);
    return new PaginatedResponseDto(
      items.map((item) => item.userId),
      total,
      limit ?? total,
      offset ?? 0,
    );
  }

  async getUserLikes(userId: string, limit?: number, offset?: number) {
    let query = this.likeModel.find({ userId });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);
    const [items, total] = await Promise.all([
      query.exec(),
      this.likeModel.countDocuments({ userId }),
    ]);
    return new PaginatedResponseDto(
      items.map((item) => item.eventId),
      total,
      limit ?? total,
      offset ?? 0,
    );
  }
}
