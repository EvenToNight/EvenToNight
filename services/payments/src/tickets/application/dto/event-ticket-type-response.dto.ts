import { EventTicketType } from '../../domain/aggregates/event-ticket-type.aggregate';

export class EventTicketTypeResponseDto {
  id: string;
  eventId: string;
  type: string;
  description?: string;
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  totalQuantity: number;
  isSoldOut: boolean;

  static fromDomain(ticketType: EventTicketType): EventTicketTypeResponseDto {
    return {
      id: ticketType.getId(),
      eventId: ticketType.getEventId().toString(),
      type: ticketType.getType().toString(),
      description: ticketType.getDescription(),
      price: ticketType.getPrice().getAmount(),
      availableQuantity: ticketType.getAvailableQuantity(),
      soldQuantity: ticketType.getSoldQuantity(),
      totalQuantity: ticketType.getTotalQuantity(),
      isSoldOut: ticketType.isSoldOut(),
    };
  }
}
