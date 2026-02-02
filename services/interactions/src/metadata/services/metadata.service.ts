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
import { EventCreatedDto } from '../dto/event-created.dto';
import { UserCreatedDto } from '../dto/user-created.dto';
import { EventCancelledDto } from '../dto/event-cancelled.dto';
import { UserDeletedDto } from '../dto/user-deleted.dto';
import { EventCompletedDto } from '../dto/event-completed.dto';
import { UserInfoDto } from 'src/commons/dto/user-info-dto';
import { UserUpdatedDto } from '../dto/user-updated.dto';
import { OrderConfirmedDto } from '../dto/order-confirmed.dto';
import { EventUpdatedDto } from '../dto/event-updated.dto';
import { EventPublishedDto } from '../dto/event-published.dto';
import { EventDeletedDto } from '../dto/event-deleted.dto';

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

  async handleEventCreated(payload: EventCreatedDto): Promise<void> {
    try {
      this.logger.debug(`Processing event.created: ${JSON.stringify(payload)}`);
      const result = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        {
          $setOnInsert: {
            eventId: payload.eventId,
            creatorId: payload.creatorId,
            collaboratorIds: payload.collaboratorIds ?? [],
            status: payload.status,
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
      this.logger.error(`Failed to handle event.created: ${error}`);
      throw error;
    }
  }

  async handleEventPublished(payload: EventPublishedDto): Promise<void> {
    try {
      this.logger.debug(
        `Processing event.published: ${JSON.stringify(payload)}`,
      );

      const updateResult = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        { status: EventStatus.PUBLISHED },
      );

      if (updateResult.modifiedCount === 0) {
        this.logger.warn(`Event ${payload.eventId} not found for publishing`);
      } else {
        this.logger.log(`Event ${payload.eventId} published in metadata`);
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

  async handleEventCancelled(payload: EventCancelledDto): Promise<void> {
    try {
      this.logger.debug(
        `Processing event.cancelled: ${JSON.stringify(payload)}`,
      );

      const deleteResult = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        { status: EventStatus.CANCELLED },
      );

      if (deleteResult.modifiedCount === 0) {
        this.logger.warn(`Event ${payload.eventId} not found for cancellation`);
      } else {
        this.logger.log(`Event ${payload.eventId} cancelled in metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle event.cancelled: ${error}`);
      throw error;
    }
  }

  async handleEventDeleted(payload: EventDeletedDto): Promise<void> {
    try {
      this.logger.debug(`Processing event.deleted: ${JSON.stringify(payload)}`);

      const deleteResult = await this.eventModel.deleteOne({
        eventId: payload.eventId,
      });

      if (deleteResult.deletedCount === 0) {
        this.logger.warn(`Event ${payload.eventId} not found for deletion`);
      } else {
        this.logger.log(`🗑️  Event ${payload.eventId} deleted from metadata`);
      }

      this.logger.log(`🧹 Cleanup completed for event ${payload.eventId}`);
    } catch (error) {
      this.logger.error(`Failed to handle event.deleted: ${error}`);
      throw error;
    }
  }

  async handleUserDeleted(payload: UserDeletedDto): Promise<void> {
    try {
      this.logger.debug(`Processing user.deleted: ${JSON.stringify(payload)}`);

      const deleteResult = await this.userModel.deleteOne({
        userId: payload.id,
      });

      if (deleteResult.deletedCount === 0) {
        this.logger.warn(`User ${payload.id} not found for deletion`);
      } else {
        this.logger.log(`🗑️  User ${payload.id} deleted from metadata`);
      }

      await Promise.all([
        this.likeService.deleteUser(payload.id),
        this.reviewService.deleteUser(payload.id),
        this.participationService.deleteUser(payload.id),
        this.followService.deleteUser(payload.id),
      ]);

      this.logger.log(`🧹 Cleanup completed for user ${payload.id}`);
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

      if (completeResult.modifiedCount === 0) {
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
      if (updateResult.modifiedCount === 0) {
        this.logger.warn(`User ${payload.id} not found for update`);
      } else {
        this.logger.log(`User ${payload.id} update from metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle user.updated: ${error}`);
      throw error;
    }
  }

  async handleEventUpdated(payload: EventUpdatedDto) {
    try {
      this.logger.debug(`Processing event.updated: ${JSON.stringify(payload)}`);

      const updateResult = await this.eventModel.updateOne(
        { eventId: payload.eventId },
        {
          collaboratorIds: payload.collaboratorIds || [],
          name: payload.name,
        },
      );
      if (updateResult.modifiedCount === 0) {
        this.logger.warn(`Event ${payload.eventId} not found for update`);
      } else {
        this.logger.log(`Event ${payload.eventId} updated from metadata`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle event.updated: ${error}`);
      throw error;
    }
  }

  async validateLikeAllowed(eventId: string, userId: string): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
      this.validateEventIsNotDraft(eventId),
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
      this.validateEventPublished(eventId),
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
      this.validateUserExistence(createReviewDto.userId),
      this.validateEventCompleted(eventId),
      this.validateUserNotCreator(eventId, createReviewDto.userId),
      this.hasParticipated(eventId, createReviewDto.userId),
    ]);
  }

  async validateReviewDeletionAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
      this.validateEventCompleted(eventId),
    ]);
  }

  async validateReviewUpdateAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(userId),
      this.validateEventCompleted(eventId),
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

  async validateEventPublished(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        `Event with ID ${eventId} is not published`,
      );
    }
  }

  async validateEventIsNotDraft(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.status === EventStatus.DRAFT) {
      throw new BadRequestException(`It is not possible to like a draft event`);
    }
  }

  private async validateEventCompleted(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    const status = event?.status || EventStatus.CANCELLED;
    if (status !== EventStatus.COMPLETED) {
      throw new BadRequestException(
        'It is not possible to review an event that is not completed',
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
    if (creatorId === userId || collaboratorIds.includes(userId)) {
      throw new BadRequestException('User cannot review their own event');
    }
  }

  async getEventInfo(
    eventId: string,
  ): Promise<{ creatorId: string; collaboratorIds: string[]; name: string }> {
    const event = await this.eventModel.findOne({ eventId }).lean();

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return {
      creatorId: event.creatorId,
      collaboratorIds: event.collaboratorIds || [],
      name: event.name,
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
      .find({
        $or: [
          { creatorId: organizationId },
          { collaboratorIds: organizationId },
        ],
      })
      .select({ eventId: 1, _id: 0 })
      .lean();

    return events.map((e) => e.eventId);
  }

  async getEventIdsByStatus(status: string): Promise<string[]> {
    const events = await this.eventModel
      .find({ status })
      .select({ eventId: 1, _id: 0 })
      .lean();

    return events.map((e) => e.eventId);
  }

  async getEventIdsByTitle(title: string): Promise<string[]> {
    const events = await this.eventModel
      .find({ name: { $regex: title, $options: 'i' } })
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
