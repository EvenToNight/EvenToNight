import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from 'src/tickets/domain/repositories/event.repository.interface';
import { EventMapper } from '../mappers/event.mapper';
import { EventDocument } from '../schemas/event.schema';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';

@Injectable()
export class EventRepositoryImpl implements EventRepository {
  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async save(event: Event): Promise<Event> {
    const document = EventMapper.toPersistence(event);
    const created = new this.eventModel(document);
    const saved = await created.save();
    return EventMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Event | null> {
    const document = await this.eventModel.findById(id).exec();
    return document ? EventMapper.toDomain(document) : null;
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.eventModel.deleteMany({}).exec();
  }
}
