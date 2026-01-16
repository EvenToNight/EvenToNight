import { Injectable } from '@nestjs/common';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';

@Injectable()
export class DeleteTicketTypeHandler {
  constructor(
    private readonly eventTicketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
  ) {}

  async handle(ticketTypeId: string): Promise<void> {
    await this.eventTicketTypeService.delete(ticketTypeId);
    return this.ticketService.revokeTickets([ticketTypeId]);
  }
}
