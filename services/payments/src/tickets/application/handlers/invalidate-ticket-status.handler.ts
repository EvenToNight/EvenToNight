import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { InvalidateTicketStatusDto } from '../dto/ticket-status.dto';
import { TransactionManager } from 'src/tickets/infrastructure/database/transaction.manager';

@Injectable()
export class InvalidateTicketStatusHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly trancsactionManager: TransactionManager,
  ) {}

  async handle(
    ticketId: string,
    _dto: InvalidateTicketStatusDto,
    _userId: string,
  ): Promise<void> {
    await this.trancsactionManager.executeInTransaction(async () => {
      const ticket = await this.ticketService.findById(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // TODO: implement ticket invalidation logic
    });
  }
}
