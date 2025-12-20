import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '../schemas/event.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class MetadataService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // TODO: Implement checks eventschema for real validation
  validateEvent(
    eventId: string,
    organizationId: string,
    collaboratorsId: string[] | undefined,
  ): void {
    void eventId;
    void organizationId;
    void collaboratorsId;
  }

  // TODO: Implement checks userschema for real validation
  validateUser(userId: string): void {
    void userId;
  }

  checkEventCompleted(eventId: string): void {
    void eventId;
  }
}
