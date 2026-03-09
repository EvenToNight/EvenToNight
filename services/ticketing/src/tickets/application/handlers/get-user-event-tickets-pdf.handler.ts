import { Injectable } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { EventService } from '../services/event.service';
import { UserService } from '../services/user.service';
import { PdfService } from '../services/pdf.service';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventNotFoundException } from '../../domain/exceptions/event-not-found.exception';
import { TicketsNotFoundException } from '../../domain/exceptions/tickets-not-found.exception';

export interface UserEventTicketsPdfResult {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class GetUserEventTicketsPdfHandler {
  constructor(
    private readonly ticketService: TicketService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly pdfService: PdfService,
  ) {}

  async handle(
    userId: string,
    eventId: string,
  ): Promise<UserEventTicketsPdfResult> {
    const tickets = await this.ticketService.findByUserIdAndEventId(
      userId,
      eventId,
      TicketStatus.ACTIVE,
    );

    if (tickets.length === 0) {
      throw new TicketsNotFoundException('No tickets found for this event');
    }

    const event = await this.eventService.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    const userLanguage = await this.userService.getUserLanguage(userId);

    const ticketPdfData = tickets.map((ticket) => ({
      ticketId: ticket.getId().toString(),
      eventId: ticket.getEventId().toString(),
      attendeeName: ticket.getAttendeeName(),
      purchaseDate: ticket.getPurchaseDate(),
      eventDate: event.getDate(),
      priceLabel: `${ticket.getPrice().getAmount()} ${ticket.getPrice().getCurrency()}`,
      eventTitle: event.getTitle() || 'EventoNight',
    }));

    const buffer = await this.pdfService.generateTicketsPdf(
      ticketPdfData,
      userLanguage,
    );

    return { buffer, filename: `tickets-${userId}-${eventId}.pdf` };
  }
}
