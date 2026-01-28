import { ClientSession } from 'mongoose';
import { EventTicketType } from '../aggregates/event-ticket-type.aggregate';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';
import { EventId } from '../value-objects/event-id.vo';

//TODO: remove ClientSession dependecy from domain
export interface EventTicketTypeRepository {
  save(ticketType: EventTicketType): Promise<EventTicketType>;
  findById(id: string): Promise<EventTicketType | null>;
  findByEventId(eventId: string): Promise<EventTicketType[]>;
  update(
    ticketType: EventTicketType,
    session: ClientSession,
  ): Promise<EventTicketType>;
  delete(id: string, session: ClientSession): Promise<void>;

  // Pessimistic locking for inventory management
  findByIdWithLock(
    id: string,
    session: ClientSession,
  ): Promise<EventTicketType | null>;

  findByEventIdWithLock(
    eventId: string,
    session: ClientSession,
  ): Promise<EventTicketType[]>;

  saveWithLock(
    ticketType: EventTicketType,
    session: ClientSession,
  ): Promise<EventTicketType>;

  deleteAll(): Promise<void>;

  findEventIds(params?: {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    sortOrder?: 'asc' | 'desc';
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<EventId>>;
}

export const EVENT_TICKET_TYPE_REPOSITORY = Symbol(
  'EVENT_TICKET_TYPE_REPOSITORY',
);
