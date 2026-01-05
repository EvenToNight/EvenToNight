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

interface EventPublishedPayload {
  eventId: string;
  creatorId: string;
  collaboratorIds?: string[];
}

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

  async handleEventPublished(payload: unknown): Promise<void> {
    console.log('Handling event published in MetadataService:', payload);

    const wrapper = payload as { EventPublished?: EventPublishedPayload };
    const data = wrapper.EventPublished;

    if (!data || !data.eventId || !data.creatorId) {
      this.logger.error('Invalid payload for EventPublished event', payload);
      return;
    }

    await this.eventModel.updateOne(
      { eventId: data.eventId },
      {
        $setOnInsert: {
          eventId: data.eventId,
          creatorId: data.creatorId,
          collaboratorIds: data.collaboratorIds ?? [],
        },
      },
      { upsert: true },
    );
    this.logger.log(`Event ${data.eventId} stored`);
  }

  async handleUserRegistered(payload: unknown): Promise<void> {
    console.log('Handling user registered in MetadataService:', payload);

    const wrapper = payload as {
      UserRegistered?: { userId: string; role: string };
    };
    const data = wrapper.UserRegistered;
    if (!data || !data.userId) {
      this.logger.error('Invalid payload for UserRegistered event', payload);
      return;
    }

    await this.userModel.updateOne(
      { userId: data.userId },
      {
        $setOnInsert: {
          userId: data.userId,
          role: data.role,
        },
      },
      { upsert: true },
    );
    this.logger.log(`User ${data.userId} (${data.role}) stored`);
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
    await this.validateEventExistence(eventId);
    await this.validateUserExistence(userId);
    await this.validateMember(userId);
  }

  async validateParticipationAllowed(
    eventId: string,
    userId: string,
  ): Promise<void> {
    await this.validateEventExistence(eventId);
    await this.validateUserExistence(userId);
    await this.validateMember(userId);
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

  // TODO: check if user is a member
  // For now, in interactions service, there isn't difference between members and organizations
  async validateMember(userId: string): Promise<void> {
    void userId;
  }

  // TODO: check if user is an organization
  async validateOrganization(userId: string): Promise<void> {
    void userId;
  }
}
