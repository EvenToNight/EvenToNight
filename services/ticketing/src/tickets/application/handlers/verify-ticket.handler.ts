import { Inject, Injectable } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import {
  TRANSACTION_MANAGER,
  Transactional,
  type TransactionManager,
} from '@libs/ts-common';
import { TicketNotFoundException } from 'src/tickets/domain/exceptions/ticket-not-found-exception';

@Injectable()
export class VerifyTicketHandler {
  constructor(
    private readonly ticketService: TicketService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  @Transactional()
  async handle(ticketId: string): Promise<boolean> {
    const ticket = await this.ticketService.findById(ticketId);
    if (!ticket) throw new TicketNotFoundException(ticketId);
    if (ticket.isUsed()) return false;
    ticket.use();
    await this.ticketService.update(ticket);
    return true;
  }
}
