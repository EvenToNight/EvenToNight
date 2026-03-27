import { Inject, Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { EventService } from '../services/event.service';
import { TicketTypeDeletedEvent } from 'src/tickets/domain/events/ticket-type-deleted.event';
import { OutboxService } from '@libs/nestjs-common';
import {
  TRANSACTION_MANAGER,
  Transactional,
  type TransactionManager,
} from '@libs/ts-common';

@Injectable()
export class DeleteTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  @Transactional()
  async handle(ticketTypeId: string): Promise<void> {
    const ticketType = await this.eventTicketTypeService.findById(ticketTypeId);
    if (!ticketType) {
      return;
    }

    const eventId = ticketType.getEventId();
    const eventTicketTypes = await this.eventTicketTypeService.findByEventId(
      eventId.toString(),
    );
    if (eventTicketTypes.length === 1) {
      await this.eventService.delete(eventId.toString());
    }
    await this.eventTicketTypeService.delete(ticketTypeId);

    await Promise.all([
      this.outboxService.addEvent(
        new TicketTypeDeletedEvent({ ticketTypeId }),
        'ticket-type.deleted',
      ),
      this.ticketService.revokeTickets([ticketTypeId]),
    ]);
  }
}
