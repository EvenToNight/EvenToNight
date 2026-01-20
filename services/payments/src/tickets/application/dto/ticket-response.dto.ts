import { Ticket } from '../../domain/aggregates/ticket.aggregate';

export class TicketResponseDto {
  id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  ticketTypeId: string;
  price: {
    amount: number;
    currency: string;
  };
  purchaseDate: Date;
  status: string;

  static fromDomain(ticket: Ticket): TicketResponseDto {
    return {
      id: ticket.getId(),
      eventId: ticket.getEventId().toString(),
      userId: ticket.getUserId().toString(),
      attendeeName: ticket.getAttendeeName(),
      ticketTypeId: ticket.getTicketTypeId(),
      price: {
        amount: ticket.getPrice().getAmount(),
        currency: ticket.getPrice().getCurrency(),
      },
      purchaseDate: ticket.getPurchaseDate(),
      status: ticket.getStatus().toString(),
    };
  }
}
