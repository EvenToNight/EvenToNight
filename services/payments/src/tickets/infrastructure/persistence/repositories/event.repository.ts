import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRepository } from 'src/tickets/domain/repositories/event.repository.interface';
import { EventMapper } from '../mappers/event.mapper';
import { EventDocument } from '../schemas/event.schema';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { BaseMongoRepository } from './base-mongo.repository';

@Injectable()
export class EventRepositoryImpl
  extends BaseMongoRepository
  implements EventRepository
{
  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
  ) {
    super();
  }

  async save(event: Event): Promise<Event> {
    const session = this.getSession();

    const document = EventMapper.toPersistence(event);
    const created = new this.eventModel(document);
    const saved = await created.save({ session: session || undefined });
    return EventMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Event | null> {
    const session = this.getSession();

    const document = await this.eventModel
      .findById(id)
      .session(session || null)
      .exec();
    return document ? EventMapper.toDomain(document) : null;
  }

  async update(event: {
    eventId: EventId;
    date?: Date;
    title?: string;
    status: EventStatus;
  }): Promise<Event> {
    const session = this.getSession();

    const updated = await this.eventModel
      .findByIdAndUpdate(
        event.eventId.toString(),
        {
          $set: {
            date: event.date,
            title: event.title,
            status: event.status.toString(),
          },
        },
        { new: true },
      )
      .session(session || null)
      .exec();
    if (!updated) {
      throw new Error(`Event with id ${event.eventId.toString()} not found`);
    }
    return EventMapper.toDomain(updated);
  }

  async updateStatus(eventId: EventId, status: EventStatus): Promise<Event> {
    const session = this.getSession();

    const updated = await this.eventModel
      .findByIdAndUpdate(
        eventId.toString(),
        {
          $set: {
            status: status.toString(),
          },
        },
        { new: true },
      )
      .session(session || null)
      .exec();
    if (!updated) {
      throw new Error(`Event with id ${eventId.toString()} not found`);
    }
    return EventMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const session = this.getSession();

    await this.eventModel
      .findByIdAndDelete(id)
      .session(session || null)
      .exec();
  }

  async deleteAll(): Promise<void> {
    const session = this.getSession();

    await this.eventModel
      .deleteMany({})
      .session(session || null)
      .exec();
  }
}
