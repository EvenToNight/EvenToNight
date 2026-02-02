import {
  Injectable,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participation } from '../schemas/participation.schema';
import { PaginatedResponseDto } from '../../commons/dto/paginated-response.dto';
import { MetadataService } from '../../metadata/services/metadata.service';
import { UserInfoDto } from 'src/commons/dto/user-info-dto';
import { ReviewService } from './review.service';
import { UserParticipationDto } from '../dto/user-participation.dto';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectModel(Participation.name)
    private participationModel: Model<Participation>,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
    private readonly reviewService: ReviewService,
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

    if (items.length === 0) {
      return new PaginatedResponseDto([], total, limit ?? total, offset ?? 0);
    }

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
    organizationId?: string,
    reviewed?: boolean,
    eventStatus?: string,
    order?: 'asc' | 'desc',
    title?: string,
  ): Promise<PaginatedResponseDto<UserParticipationDto>> {
    await this.metadataService.validateUserExistence(userId);

    const sortOrder = order === 'asc' ? 1 : -1;
    const query = this.participationModel
      .find({ userId })
      .select({ _id: 0, eventId: 1, createdAt: 1 })
      .sort({ createdAt: sortOrder });

    const items = await query.exec();

    if (items.length === 0) {
      return new PaginatedResponseDto([], 0, limit ?? 0, offset ?? 0);
    }

    const eventIds = items.map((item) => item.eventId);

    const reviewedEventIds = await this.reviewService.getUserReviewedEventIds(
      userId,
      eventIds,
    );
    const reviewedSet = new Set(reviewedEventIds);

    let enrichedItems = items.map((item) => ({
      eventId: item.eventId,
      reviewed: reviewedSet.has(item.eventId),
    }));

    if (organizationId !== undefined) {
      const orgEventIds =
        await this.metadataService.getEventIdsByOrganization(organizationId);
      const orgEventSet = new Set(orgEventIds);
      enrichedItems = enrichedItems.filter((item) =>
        orgEventSet.has(item.eventId),
      );
      if (enrichedItems.length === 0) {
        return new PaginatedResponseDto([], 0, limit ?? 0, offset ?? 0);
      }
    }

    if (eventStatus !== undefined) {
      const statusEventIds =
        await this.metadataService.getEventIdsByStatus(eventStatus);
      const statusEventSet = new Set(statusEventIds);
      enrichedItems = enrichedItems.filter((item) =>
        statusEventSet.has(item.eventId),
      );
      if (enrichedItems.length === 0) {
        return new PaginatedResponseDto([], 0, limit ?? 0, offset ?? 0);
      }
    }

    if (reviewed !== undefined) {
      enrichedItems = enrichedItems.filter(
        (item) => item.reviewed === reviewed,
      );
      if (enrichedItems.length === 0) {
        return new PaginatedResponseDto([], 0, limit ?? 0, offset ?? 0);
      }
    }

    if (title !== undefined) {
      const titleEventIds =
        await this.metadataService.getEventIdsByTitle(title);
      const titleEventSet = new Set(titleEventIds);
      enrichedItems = enrichedItems.filter((item) =>
        titleEventSet.has(item.eventId),
      );
      if (enrichedItems.length === 0) {
        return new PaginatedResponseDto([], 0, limit ?? 0, offset ?? 0);
      }
    }

    const filteredTotal = enrichedItems.length;

    const start = offset ?? 0;
    const end = limit !== undefined ? start + limit : undefined;
    const paginatedItems = enrichedItems.slice(start, end);

    return new PaginatedResponseDto(
      paginatedItems,
      filteredTotal,
      limit ?? filteredTotal,
      offset ?? 0,
    );
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
