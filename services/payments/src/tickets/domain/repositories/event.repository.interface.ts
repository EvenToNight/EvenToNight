import { Event } from '../aggregates/event.aggregate';

export interface EventRepository {
  save(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  update(event: Event): Promise<Event>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
