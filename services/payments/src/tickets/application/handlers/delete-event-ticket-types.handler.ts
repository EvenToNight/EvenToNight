import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { EventService } from '../services/event.service';

@Injectable()
export class DeleteEventTicketTypesHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
  ) {}

  async handle(eventId: string): Promise<void> {
    const deletedEventTicketTypesIds =
      await this.eventTicketTypeService.deleteEventTicketTypes(eventId);
    await this.eventService.delete(eventId);
    return this.ticketService.revokeTickets(deletedEventTicketTypesIds);
  }
}
