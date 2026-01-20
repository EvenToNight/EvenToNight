import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventStatus } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { LikeService } from '../../events/services/like.service';
import { ReviewService } from '../../events/services/review.service';
import { ParticipationService } from '../../events/services/participation.service';
import { FollowService } from '../../users/services/follow.service';
import { CreateReviewDto } from 'src/events/dto/create-review.dto';
import { EventPublishedDto } from '../dto/event-published.dto';
import { UserCreatedDto } from '../dto/user-created.dto';
import { EventDeletedDto } from '../dto/event-deleted.dto';
import { UserDeletedDto } from '../dto/user-deleted.dto';
import { EventCompletedDto } from '../dto/event-completed.dto';
import { UserInfoDto } from 'src/commons/dto/user-info-dto';
import { UserUpdatedDto } from '../dto/user-updated.dto';
import { OrderConfirmedDto } from '../dto/order-confirmed.dto';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => LikeService))
    private readonly likeService: LikeService,
    @Inject(forwardRef(() => ReviewService))
    private readonly reviewService: ReviewService,
    @Inject(forwardRef(() => ParticipationService))
    private readonly participationService: ParticipationService,
    @Inject(forwardRef(() => FollowService))
    private readonly followService: FollowService,
  ) {}

  async handleEventPublished(payload: EventPublishedDto): Promise<void> {
    try {
      this.logger.debug(
        `Processing event.published: ${JSON.stringify(payload)}`,
      );
      const result = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        {
          $setOnInsert: {
            eventId: payload.eventId,
            creatorId: payload.creatorId,
            collaboratorIds: payload.collaboratorIds ?? [],
            status: EventStatus.PUBLISHED,
            name: payload.name,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        this.logger.log(`Event ${payload.eventId} created`);
      } else {
        this.logger.log(`Event ${payload.eventId} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle event.published: ${error}`);
      throw error;
    }
  }

  async handleUserCreated(payload: UserCreatedDto): Promise<void> {
    try {
      this.logger.debug(`Processing user.created: ${JSON.stringify(payload)}`);

      const result = await this.userModel.updateOne(
        { userId: payload.id },
        {
          $setOnInsert: {
            userId: payload.id,
            role: payload.role,
            username: payload.username,
            name: payload.name,
            avatar: payload.avatar,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        this.logger.log(`User ${payload.id} (${payload.role}) created`);
      } else {
        this.logger.log(`User ${payload.id} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle user.created: ${error}`);
      throw error;
    }
  }

  async handleEventDeleted(payload: EventDeletedDto): Promise<void> {
    try {
      this.logger.debug(`Processing event.deleted: ${JSON.stringify(payload)}`);

      const deleteResult = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        { status: EventStatus.CANCELLED },
      );

      if (deleteResult.modifiedCount === 0) {
        this.logger.warn(`Event ${payload.eventId} not found for deletion`);
      } else {
        this.logger.log(`Event ${payload.eventId} deleted from metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle event.deleted: ${error}`);
      throw error;
    }
  }

  async handleUserDeleted(payload: UserDeletedDto): Promise<void> {
    try {
      this.logger.debug(`Processing user.deleted: ${JSON.stringify(payload)}`);

      const deleteResult = await this.userModel.deleteOne({
        userId: payload.userId,
      });

      if (deleteResult.deletedCount === 0) {
        this.logger.warn(`User ${payload.userId} not found for deletion`);
      } else {
        this.logger.log(`🗑️  User ${payload.userId} deleted from metadata`);
      }

      await Promise.all([
        this.likeService.deleteUser(payload.userId),
        this.reviewService.deleteUser(payload.userId),
        this.participationService.deleteUser(payload.userId),
        this.followService.deleteUser(payload.userId),
      ]);

      this.logger.log(`🧹 Cleanup completed for user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle user.deleted: ${error}`);
      throw error;
    }
  }

  async handleEventCompleted(payload: EventCompletedDto) {
    try {
      this.logger.debug(
        `Processing event.completed: ${JSON.stringify(payload)}`,
      );

      const completeResult = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        { status: EventStatus.COMPLETED },
      );

      if (completeResult.modifiedCount == 0) {
        this.logger.warn(`Event ${payload.eventId} not found for update`);
      } else {
        this.logger.log(`Event ${payload.eventId} completed from metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle event.completed: ${error}`);
      throw error;
    }
  }

  async handleUserUpdated(payload: UserUpdatedDto) {
    try {
      this.logger.debug(`Processing user.updated: ${JSON.stringify(payload)}`);

      const updateResult = await this.userModel.updateOne(
        { userId: payload.id },
        {
          name: payload.name,
          username: payload.username,
          role: payload.role,
          avatar: payload.avatar,
        },
      );
      if (updateResult.modifiedCount == 0) {
        this.logger.warn(`User ${payload.id} not found for update`);
      } else {
        this.logger.log(`User ${payload.id} update from metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle user.updated: ${error}`);
      throw error;
    }
  }

  async validateLikeAllowed(eventId: string, userId: string): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
    ]);
  }

  async validateUnlikeAllowed(eventId: string, userId: string): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
    ]);
  }

  async validateParticipationAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
    ]);
  }

  async validateFollowAllowed(
    followerId: string,
    followeeId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateUserExistence(followerId),
      this.validateUserExistence(followeeId),
    ]);
  }

  async validateUnfollowAllowed(
    followerId: string,
    followeeId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateUserExistence(followerId),
      this.validateUserExistence(followeeId),
    ]);
  }

  async validateReviewAllowed(
    eventId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(createReviewDto.userId),
      this.validateEventCompleted(eventId),
      this.validateUserNotCreator(eventId, createReviewDto.userId),
      /* MOCK VALIDATION - Uncomment for real validation */
      // this.hasParticipated(eventId, createReviewDto.userId);
    ]);
  }

  async validateReviewDeletionAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
    ]);
  }

  async validateReviewUpdateAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
    ]);
  }

  async validateEventExistence(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  }

  async validateUserExistence(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async validateEventCompleted(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    const status = event?.status || EventStatus.CANCELLED;
    if (status != EventStatus.COMPLETED) {
      throw new BadRequestException(
        'It is not possible to review a event not completed',
      );
    }
  }

  private async hasParticipated(
    eventId: string,
    userId: string,
  ): Promise<void> {
    const hasParticipated = await this.participationService.hasUserParticipated(
      userId,
      eventId,
    );
    if (!hasParticipated) {
      throw new NotFoundException(
        `User with ID ${userId} has not participated in event ${eventId}`,
      );
    }
  }

  async validateUserNotCreator(eventId: string, userId: string): Promise<void> {
    const { creatorId, collaboratorIds } = await this.getEventInfo(eventId);
    if (creatorId == userId || collaboratorIds.includes(userId)) {
      throw new BadRequestException('User cannot review their own event');
    }
  }

  async getEventInfo(
    eventId: string,
  ): Promise<{ creatorId: string; collaboratorIds: string[] }> {
    const event = await this.eventModel.findOne({ eventId }).lean();

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return {
      creatorId: event.creatorId,
      collaboratorIds: event.collaboratorIds || [],
    };
  }

  async getUserInfo(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getUsersInfo(userIds: string[]): Promise<UserInfoDto[]> {
    if (userIds.length === 0) return [];

    const users = await this.userModel
      .find({ userId: { $in: userIds } })
      .select({ userId: 1, avatar: 1, name: 1, username: 1, _id: 0 })
      .lean();

    return users as UserInfoDto[];
  }

  async getEventIdsByOrganization(organizationId: string): Promise<string[]> {
    const events = await this.eventModel
      .find({ organizationId })
      .select({ eventId: 1, _id: 0 })
      .lean();

    return events.map((e) => e.eventId);
  }

  async handleOrderConfirmed(payload: OrderConfirmedDto): Promise<void> {
    try {
      this.logger.debug(
        `Processing payments.order.confirmed: ${JSON.stringify(payload)}`,
      );
      await this.participationService.participate(
        payload.eventId,
        payload.userId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle payments.order.confirmed: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }
}
