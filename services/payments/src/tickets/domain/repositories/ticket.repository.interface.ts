import { Ticket } from '../aggregates/ticket.aggregate';
import { PaginatedResult, PaginationParams } from '@libs/ts-common';
import { EventId } from '../value-objects/event-id.vo';
import { TicketStatus } from '../value-objects/ticket-status.vo';

export interface TicketRepository {
  save(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>>;
  findByEventId(
    eventId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>>;
  findByUserIdAndEventId(
    userId: string,
    eventId: string,
    status?: TicketStatus,
  ): Promise<Ticket[]>;
  findEventsByUserId(
    userId: string,
    pagination?: PaginationParams,
    status?: string,
    order?: 'asc' | 'desc',
  ): Promise<PaginatedResult<EventId>>;
  findByTicketTypeId(ticketTypeId: string): Promise<Ticket[]>;
  update(ticket: Ticket): Promise<Ticket>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');
