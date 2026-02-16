import { Inject, Injectable } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from 'src/libs/ts-common/src/database/interfaces/transaction-manager.interface';

@Injectable()
export class VerifyTicketHandler {
  constructor(
    private readonly ticketService: TicketService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(ticketId: string): Promise<boolean> {
    return await this.transactionManager.executeInTransaction(async () => {
      const ticket = await this.ticketService.findById(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      if (ticket.isUsed()) return false;

      ticket.use();
      await this.ticketService.update(ticket);
      return true;
    });
  }
}
