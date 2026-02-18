import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { EventPublisher } from '@libs/nestjs-common';
import { TicketTypeDeletedEvent } from 'src/tickets/domain/events/ticket-type-deleted.event';
// import { EventService } from '../services/event.service';

@Injectable()
export class DeleteEventTicketTypesHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly eventPublisher: EventPublisher,
    // private readonly eventService: EventService,
  ) {}

  async handle(eventId: string): Promise<void> {
    const deletedEventTicketTypesIds =
      await this.eventTicketTypeService.deleteEventTicketTypes(eventId);
    for (const id of deletedEventTicketTypesIds) {
      this.eventPublisher.publish(
        new TicketTypeDeletedEvent({
          ticketTypeId: id,
        }),
        'ticket-type.deleted',
      );
    }
    //TODO: delete also event?
    //await this.eventService.delete(eventId);
    return this.ticketService.revokeTickets(deletedEventTicketTypesIds);
  }
}
