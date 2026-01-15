import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';

@Injectable()
export class DeleteEventTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
  ) {}

  async handle(eventId: string): Promise<void> {
    const deletedEventTicketTypesIds =
      await this.eventTicketTypeService.deleteEventTicketTypes(eventId);
    return this.ticketService.revokeTickets(deletedEventTicketTypesIds);
  }
}
