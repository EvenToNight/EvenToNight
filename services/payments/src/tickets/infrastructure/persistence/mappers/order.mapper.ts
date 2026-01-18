import { Order } from '../../../domain/aggregates/order.aggregate';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { OrderStatus } from '../../../domain/value-objects/order-status.vo';
import { OrderDocument } from '../schemas/order.schema';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';

export class OrderMapper {
  static toDomain(document: OrderDocument): Order {
    return Order.create({
      id: document._id.toString(),
      userId: UserId.fromString(document.userId),
      eventId: EventId.fromString(document.eventId),
      ticketIds: document.ticketIds,
      status: OrderStatus.fromString(document.status),
      createdAt: document.createdAt,
    });
  }

  static toPersistence(order: Order): Partial<OrderDocument> {
    return {
      _id: order.getId() as any,
      userId: order.getUserId().toString(),
      eventId: order.getEventId().toString(),
      ticketIds: order.getTicketIds(),
      status: order.getStatus().toString(),
      createdAt: order.getCreatedAt(),
    };
  }
}
