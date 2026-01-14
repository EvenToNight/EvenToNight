import { Ticket } from '../aggregates/ticket.aggregate';
import { PaginatedResult, PaginationParams } from '../types/pagination.types';

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
  update(ticket: Ticket): Promise<Ticket>;
  delete(id: string): Promise<void>;
}

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');
