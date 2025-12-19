import { Injectable, BadRequestException } from '@nestjs/common';
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
  async validateEvent(
    eventId: string,
    organizationId: string,
    collaboratorsId: string[] | undefined,
  ): Promise<void> {
    true;
  }

  // TODO: Implement checks userschema for real validation
  async validateUser(userId: string): Promise<void> {
    true;
  }

  async checkEventCompleted(eventId: string): Promise<void> {
    true;
  }
}
