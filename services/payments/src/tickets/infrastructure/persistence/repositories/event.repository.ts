import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from 'src/tickets/domain/repositories/event.repository.interface';
import { EventMapper } from '../mappers/event.mapper';
import { EventDocument } from '../schemas/event.schema';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';

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

  async update(event: {
    eventId: EventId;
    date: Date;
    status: EventStatus;
  }): Promise<Event> {
    const updated = await this.eventModel
      .findByIdAndUpdate(
        event.eventId.toString(),
        {
          $set: {
            date: event.date,
            status: event.status.toString(),
          },
        },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new Error(`Event with id ${event.eventId.toString()} not found`);
    }
    return EventMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.eventModel.deleteMany({}).exec();
  }
}
