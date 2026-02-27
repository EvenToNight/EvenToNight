import { Inject, Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { OutboxService } from '@libs/nestjs-common';
import {
  TRANSACTION_MANAGER,
  Transactional,
  type TransactionManager,
} from '@libs/ts-common';
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

  @Transactional()
  async handle(eventId: string): Promise<void> {
    const deletedEventTicketTypesIds =
      await this.eventTicketTypeService.deleteEventTicketTypes(eventId);
    await Promise.all(
      deletedEventTicketTypesIds.map((id) =>
        this.outboxService.addEvent(
          new TicketTypeDeletedEvent({ ticketTypeId: id }),
          'ticket-type.deleted',
        ),
      ),
    );
    await this.ticketService.revokeTickets(deletedEventTicketTypesIds);
  }
}
