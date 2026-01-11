import { Ticket } from '../../../domain/aggregates/ticket.aggregate';
import { EventId } from '../../../domain/value-objects/event-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { TicketStatus } from '../../../domain/value-objects/ticket-status.vo';
import { TicketDocument } from '../schemas/ticket.schema';

export class TicketMapper {
  static toDomain(document: TicketDocument): Ticket {
    return Ticket.create({
      id: document._id.toString(),
      eventId: EventId.fromString(document.eventId),
      userId: UserId.fromString(document.userId),
      attendeeName: document.attendeeName,
      ticketTypeId: document.ticketTypeId,
      price: Money.fromAmount(document.price.amount, document.price.currency),
      purchaseDate: document.purchaseDate,
      status: TicketStatus.fromString(document.status),
    });
  }

  static toPersistence(ticket: Ticket): Partial<TicketDocument> {
    return {
      _id: ticket.getId() as any,
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
