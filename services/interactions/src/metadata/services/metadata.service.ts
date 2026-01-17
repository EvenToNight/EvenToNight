import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
import { LikeService } from '../../events/services/like.service';
import { ReviewService } from '../../events/services/review.service';
import { ParticipationService } from '../../events/services/participation.service';
import { FollowService } from '../../users/services/follow.service';
import { CreateReviewDto } from 'src/events/dto/create-review.dto';
import { EventPublishedDto } from '../dto/event-published.dto';
import { UserCreatedDto } from '../dto/user-created.dto';

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
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        this.logger.log(`✨ Event ${payload.eventId} created`);
      } else {
        this.logger.log(`🔄 Event ${payload.eventId} already exists`);
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
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        this.logger.log(`✨ User ${payload.id} (${payload.role}) created`);
      } else {
        this.logger.log(`🔄 User ${payload.id} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle user.created: ${error}`);
      throw error;
    }
  }

  async handleEventDeleted(payload: unknown): Promise<void> {
    console.log('Handling event deleted in MetadataService:', payload);

    const wrapper = payload as { EventDeleted?: { eventId: string } };
    const data = wrapper.EventDeleted;
    if (!data || !data.eventId) {
      this.logger.error('Invalid payload for EventDeleted event', payload);
      return;
    }

    await this.eventModel.deleteOne({ eventId: data.eventId });
    this.logger.log(`Event ${data.eventId} deleted`);

    await Promise.all([
      this.likeService.deleteEvent(data.eventId),
      this.reviewService.deleteEvent(data.eventId),
      this.participationService.deleteEvent(data.eventId),
    ]);
  }

  async handleUserDeleted(payload: unknown): Promise<void> {
    console.log('Handling user deleted in MetadataService:', payload);

    const wrapper = payload as { UserDeleted?: { userId: string } };
    const data = wrapper.UserDeleted;
    if (!data || !data.userId) {
      this.logger.error('Invalid payload for UserDeleted event', payload);
      return;
    }

    await this.userModel.deleteOne({ userId: data.userId });
    this.logger.log(`User ${data.userId} deleted`);
    await Promise.all([
      this.likeService.deleteUser(data.userId),
      this.reviewService.deleteUser(data.userId),
      this.participationService.deleteUser(data.userId),
      this.followService.deleteUser(data.userId),
    ]);
  }

  async validateLikeAllowed(eventId: string, userId: string): Promise<void> {
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

  async validateReviewAllowed(
    eventId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<void> {
    await Promise.all([
      this.validateEventExistence(eventId),
      this.validateUserExistence(createReviewDto.userId),
      this.validateCreator(eventId, createReviewDto.creatorId),
      this.validateCollaborators(eventId, createReviewDto.collaboratorIds),
      /* MOCK VALIDATION - Uncomment for real validation */
      // this.hasParticipated(eventId, createReviewDto.userId);
    ]);
  }

  private async validateEventExistence(eventId: string): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  }

  private async validateUserExistence(userId: string): Promise<void> {
    /* MOCK VALIDATION - Uncomment for real validation */
    // const user = await this.userModel.findOne({ userId });
    // if (!user) {
    //   throw new NotFoundException(`User with ID ${userId} not found`);
    // }
    console.log(`Mock validation: assuming user with ID ${userId} exists`);
    await Promise.resolve();
  }

  private async validateCreator(
    eventId: string,
    creatorId: string,
  ): Promise<void> {
    const event = await this.eventModel.findOne({ eventId });
    if (event?.creatorId !== creatorId) {
      throw new NotFoundException(
        `Creator with ID ${creatorId} is not associated with event ${eventId}`,
      );
    }
  }

  private async validateCollaborators(
    eventId: string,
    collaboratorIds?: string[],
  ): Promise<void> {
    if (!collaboratorIds || collaboratorIds.length === 0) {
      return;
    }

    const event = await this.eventModel.findOne({ eventId });
    const eventCollaborators = event?.collaboratorIds || [];
    for (const collabId of collaboratorIds) {
      if (!eventCollaborators.includes(collabId)) {
        throw new NotFoundException(
          `Collaborator with ID ${collabId} is not associated with event ${eventId}`,
        );
      }
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
}
