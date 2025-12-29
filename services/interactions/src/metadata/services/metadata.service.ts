import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';
// Event payloads come from the bus; accept unknown here to avoid unsafe any

@Injectable()
export class MetadataService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  handleEventPublished(payload: unknown): Promise<void> {
    // publish event handling logic here
    console.log('Handling event published in MetadataService:', payload);
    return Promise.resolve();
  }

  // TODO: Implement checks eventschema for real validation
  validateEvent(
    eventId: string,
    organizationId: string,
    collaboratorIds: string[] | undefined,
  ): void {
    void eventId;
    void organizationId;
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
