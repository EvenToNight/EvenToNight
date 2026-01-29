import {
  Injectable,
  ConflictException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from '../schemas/like.schema';
import { PaginatedResponseDto } from '../../commons/dto/paginated-response.dto';
import { MetadataService } from 'src/metadata/services/metadata.service';
import { UserInfoDto } from '../../commons/dto/user-info-dto';
import { RabbitMqPublisherService } from 'src/rabbitmq/rabbitmq-publisher.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
    private readonly rabbitMqPublisher: RabbitMqPublisherService,
  ) {}

  async likeEvent(eventId: string, userId: string): Promise<Like> {
    await this.metadataService.validateLikeAllowed(eventId, userId);

    const existing = await this.likeModel.findOne({ eventId, userId });
    if (existing) {
      throw new ConflictException('Already liked this event');
    }

    const like = new this.likeModel({ eventId, userId });
    await like.save();

    const [eventInfo, userInfo] = await Promise.all([
      this.metadataService.getEventInfo(eventId),
      this.metadataService.getUserInfo(userId),
    ]);

    await this.rabbitMqPublisher.publishLikeCreated({
      creatorId: eventInfo.creatorId,
      eventId,
      eventName: eventInfo.name,
      userId,
      userName: userInfo.name,
      userAvatar: userInfo.avatar,
    });

    return like;
  }

  async unlikeEvent(eventId: string, userId: string): Promise<void> {
    await this.metadataService.validateUnlikeAllowed(eventId, userId);
    const result = await this.likeModel.deleteOne({ eventId, userId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Like not found');
    }
  }

  async getEventLikes(
    eventId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<UserInfoDto>> {
    await this.metadataService.validateEventExistence(eventId);
    let query = this.likeModel.find({ eventId });
    if (offset !== undefined) query = query.skip(offset);
    if (limit !== undefined) query = query.limit(limit);
    const [items, total] = await Promise.all([
      query.exec(),
      this.likeModel.countDocuments({ eventId }),
    ]);

    const userIds = items.map((item) => item.userId);
    const users = await this.metadataService.getUsersInfo(userIds);

    const userMap = new Map(users.map((u) => [u.userId, u]));

    const enrichedItems = items.map((item) => {
      const user = userMap.get(item.userId);
      return {
        userId: item.userId,
        avatar: user?.avatar || '',
        name: user?.name || '',
        username: user?.username || '',
      };
    });

    return new PaginatedResponseDto(
      enrichedItems,
      total,
      limit ?? total,
      offset ?? 0,
    );
  }

  async getUserLikes(userId: string, limit?: number, offset?: number) {
    await this.metadataService.validateUserExistence(userId);
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

  async hasUserLikedEvent(userId: string, eventId: string): Promise<boolean> {
    await this.metadataService.validateUserExistence(userId);
    await this.metadataService.validateEventExistence(eventId);
    const like = await this.likeModel.findOne({ userId, eventId });
    return !!like;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.metadataService.validateEventExistence(eventId);
    await this.likeModel.deleteMany({ eventId });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.metadataService.validateUserExistence(userId);
    await this.likeModel.deleteMany({ userId });
  }
}
