import {
  Injectable,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participation } from '../schemas/participation.schema';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { MetadataService } from '../../metadata/services/metadata.service';
import { UserInfoDto } from 'src/common/dto/user-info-dto';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectModel(Participation.name)
    private participationModel: Model<Participation>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
  ) {}

  async participate(eventId: string, userId: string): Promise<Participation> {
    await this.metadataService.validateParticipationAllowed(eventId, userId);
    const existing = await this.participationModel.findOne({ eventId, userId });
    if (existing) {
      throw new ConflictException('Already purchased ticket for this event');
    }
    const participation = new this.participationModel({ eventId, userId });
    return participation.save();
  }

  async getEventParticipants(
    eventId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<UserInfoDto>> {
    await this.metadataService.validateEventExistence(eventId);
    let query = this.participationModel.find({ eventId });

    if (offset !== undefined) {
      query = query.skip(offset);
    }
    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const [items, total] = await Promise.all([
      query.exec(),
      this.participationModel.countDocuments({ eventId }),
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

  async getUserParticipations(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedResponseDto<Participation>> {
    await this.metadataService.validateUserExistence(userId);
    const query = this.participationModel.find({ userId });
    if (offset !== undefined) {
      query.skip(offset);
    }
    if (limit !== undefined) {
      query.limit(limit);
    }
    query.sort({ createdAt: -1 });
    const [items, total] = await Promise.all([
      query.exec(),
      this.participationModel.countDocuments({ userId }),
    ]);

    return new PaginatedResponseDto(items, total, limit || total, offset || 0);
  }

  async hasUserParticipated(userId: string, eventId: string): Promise<boolean> {
    await this.metadataService.validateUserExistence(userId);
    await this.metadataService.validateEventExistence(eventId);
    const participation = await this.participationModel.findOne({
      userId,
      eventId,
    });
    return !!participation;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.metadataService.validateEventExistence(eventId);
    await this.participationModel.deleteMany({ eventId });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.metadataService.validateUserExistence(userId);
    await this.participationModel.deleteMany({ userId });
  }
}
