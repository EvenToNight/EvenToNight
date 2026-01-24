import { ClientSession } from 'mongoose';
import { Event } from '../aggregates/event.aggregate';
import { EventId } from '../value-objects/event-id.vo';
import { EventStatus } from '../value-objects/event-status.vo';

export interface EventRepository {
  save(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  findByIdWithLock(id: EventId, session: ClientSession): Promise<Event | null>;
  update(event: {
    eventId: EventId;
    date?: Date;
    status: EventStatus;
  }): Promise<Event>;
  updateStatus(eventId: EventId, status: EventStatus);
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
