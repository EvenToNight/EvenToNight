import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { TicketRepository } from 'src/tickets/domain/repositories/ticket.repository.interface';
import { TICKET_REPOSITORY } from 'src/tickets/domain/repositories/ticket.repository.interface';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/tickets/domain/types/pagination.types';

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
  ) {}

  save(ticket: Ticket): Promise<Ticket> {
    return this.ticketRepository.save(ticket);
  }

  findByIds(ticketIds: string[]): Promise<Ticket[]> {
    return Promise.all(
      ticketIds.map((id) => this.ticketRepository.findById(id)),
    ).then((tickets) => tickets.filter((t): t is Ticket => t !== null));
  }

  findById(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findById(id);
  }

  findByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    return this.ticketRepository.findByUserId(userId, pagination);
  }
}
