import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';

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

  // TODO: Implement checks eventschema for real validation
  validateEvent(
    eventId: string,
    creatorId: string,
    collaboratorIds: string[] | undefined,
  ): void {
    void eventId;
    void creatorId;
    void collaboratorIds;
  }

  // TODO: Implement checks userschema for real validation
  validateUser(userId: string): void {
    void userId;
  }

  checkEventCompleted(eventId: string): void {
    void eventId;
  }
}
