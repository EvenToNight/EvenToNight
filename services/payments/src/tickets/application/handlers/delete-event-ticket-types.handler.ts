import { Inject, Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { OutboxService } from '@libs/nestjs-common';
import { TRANSACTION_MANAGER, type TransactionManager } from '@libs/ts-common';
import { TicketTypeDeletedEvent } from 'src/tickets/domain/events/ticket-type-deleted.event';

@Injectable()
export class DeleteEventTicketTypesHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly outboxService: OutboxService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(eventId: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async () => {
      const deletedEventTicketTypesIds =
        await this.eventTicketTypeService.deleteEventTicketTypes(eventId);
      for (const id of deletedEventTicketTypesIds) {
        await this.outboxService.addEvent(
          new TicketTypeDeletedEvent({
            ticketTypeId: id,
          }),
          'ticket-type.deleted',
        );
      }
      await this.ticketService.revokeTickets(deletedEventTicketTypesIds);
    });
  }
}
