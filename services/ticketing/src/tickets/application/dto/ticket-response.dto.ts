import { Ticket } from '../../domain/aggregates/ticket.aggregate';

export class TicketResponseDto {
  id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  ticketTypeId: string;
  price: number;
  purchaseDate: Date;
  status: string;

  static fromDomain(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.getId().toString(),
      eventId: ticket.getEventId().toString(),
      userId: ticket.getUserId().toString(),
      attendeeName: ticket.getAttendeeName(),
      ticketTypeId: ticket.getTicketTypeId().toString(),
      price: ticket.getPrice().getAmount(),
      purchaseDate: ticket.getPurchaseDate(),
      status: ticket.getStatus().toString(),
    };
  }
}
