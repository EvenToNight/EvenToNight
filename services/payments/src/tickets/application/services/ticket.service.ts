import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { TicketRepository } from 'src/tickets/domain/repositories/ticket.repository.interface';
import { TICKET_REPOSITORY } from 'src/tickets/domain/repositories/ticket.repository.interface';
import {
  Ticket,
  TicketCreateParams,
} from 'src/tickets/domain/aggregates/ticket.aggregate';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
  ) {}

  create(createParams: TicketCreateParams): Promise<Ticket> {
    if (!createParams.status) {
      createParams.status = TicketStatus.PENDING_PAYMENT;
    }
    return this.save(Ticket.create(createParams));
  }

  save(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.save(ticket);
  }

  saveMany(tickets: Ticket[]): Promise<Ticket[]> {
    return Promise.all(tickets.map((ticket) => this.save(ticket)));
  }

  findByIds(ticketIds: string[]): Promise<Ticket[]> {
    return Promise.all(ticketIds.map((id) => this.findById(id))).then(
      (tickets) => tickets.filter((t): t is Ticket => t !== null),
    );
  }

  findById(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findById(id);
  }

  update(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.update(ticket);
  }

  deleteAll(): Promise<void> {
    return this.ticketRepository.deleteAll();
  }

  findByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    return this.ticketRepository.findByUserId(userId, pagination);
  }

  findByUserIdAndEventId(
    userId: string,
    eventId: string,
    status?: TicketStatus,
  ): Promise<Ticket[]> {
    return this.ticketRepository.findByUserIdAndEventId(
      userId,
      eventId,
      status,
    );
  }

  findEventsByUserId(
    userId: string,
    pagination: PaginationParams,
    status?: string,
    order?: 'asc' | 'desc',
  ): Promise<PaginatedResult<EventId>> {
    return this.ticketRepository.findEventsByUserId(
      userId,
      pagination,
      status,
      order,
    );
  }

  revokeTickets(eventTicketTypeIds: string[]): Promise<void> {
    return Promise.all(
      eventTicketTypeIds.map(async (id) => {
        const tickets = await this.ticketRepository.findByTicketTypeId(id);
        await Promise.all(
          tickets.map((ticket) => {
            ticket.cancel();
            return this.update(ticket);
          }),
        );
      }),
    ).then(() => {
      return;
    });
  }
}
