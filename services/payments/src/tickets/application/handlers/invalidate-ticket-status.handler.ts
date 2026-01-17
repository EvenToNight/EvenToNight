import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { TransactionManager } from 'src/tickets/infrastructure/database/transaction.manager';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';

@Injectable()
export class InvalidateTicketStatusHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(ticketId: string): Promise<Ticket> {
    return await this.transactionManager.executeInTransaction(async () => {
      const ticket = await this.ticketService.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      ticket.use();
      await this.ticketService.update(ticket);
      return ticket;
    });
  }
}
