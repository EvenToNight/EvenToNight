import { ClientSession } from 'mongoose';
import { EventTicketType } from '../aggregates/event-ticket-type.aggregate';

export interface EventTicketTypeRepository {
  save(ticketType: EventTicketType): Promise<EventTicketType>;
  findById(id: string): Promise<EventTicketType | null>;
  findByEventId(eventId: string): Promise<EventTicketType[]>;
  update(ticketType: EventTicketType): Promise<EventTicketType>;
  delete(id: string): Promise<void>;

  // Pessimistic locking for inventory management
  findByIdWithLock(
    id: string,
    session: ClientSession,
  ): Promise<EventTicketType | null>;
}

export const EVENT_TICKET_TYPE_REPOSITORY = Symbol(
  'EVENT_TICKET_TYPE_REPOSITORY',
);
