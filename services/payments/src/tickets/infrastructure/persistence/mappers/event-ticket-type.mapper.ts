import { EventTicketType } from '../../../domain/aggregates/event-ticket-type.aggregate';
import { EventId } from '../../../domain/value-objects/event-id.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { TicketType } from '../../../domain/value-objects/ticket-type.vo';
import { EventTicketTypeDocument } from '../schemas/event-ticket-type.schema';

export class EventTicketTypeMapper {
  static toDomain(document: EventTicketTypeDocument): EventTicketType {
    return EventTicketType.create({
      id: document._id.toString(),
      eventId: EventId.fromString(document.eventId),
      type: TicketType.fromString(document.type),
      description: document.description,
      price: Money.fromAmount(document.price.amount, document.price.currency),
      availableQuantity: document.availableQuantity,
      soldQuantity: document.soldQuantity,
    });
  }

  static toPersistence(
    ticketType: EventTicketType,
  ): Partial<EventTicketTypeDocument> {
    return {
      _id: ticketType.getId() as any,
      eventId: ticketType.getEventId().toString(),
      type: ticketType.getType().toString(),
      description: ticketType.getDescription(),
      price: {
        amount: ticketType.getPrice().getAmount(),
        currency: ticketType.getPrice().getCurrency(),
      },
      availableQuantity: ticketType.getAvailableQuantity(),
      soldQuantity: ticketType.getSoldQuantity(),
    };
  }
}
