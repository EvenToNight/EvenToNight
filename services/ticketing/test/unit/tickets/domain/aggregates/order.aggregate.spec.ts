import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { TicketId } from 'src/tickets/domain/value-objects/ticket-id.vo';
import { OrderId } from 'src/tickets/domain/value-objects/order-id.vo';
import { OrderStatus } from 'src/tickets/domain/value-objects/order-status.vo';
import { InvalidOrderStatusTransitionException } from 'src/tickets/domain/exceptions/invalid-order-status-transition.exception';
import { EmptyOrderTicketsException } from 'src/tickets/domain/exceptions/empty-order-tickets.exception';

describe('Order Aggregate', () => {
  const createOrder = (overrides?: {
    id?: OrderId;
    status?: OrderStatus;
    createdAt?: Date;
  }) => {
    return Order.create({
      id: overrides?.id,
      userId: UserId.fromString('user-123'),
      eventId: EventId.fromString('event-456'),
      ticketIds: [
        TicketId.fromString('ticket-1'),
        TicketId.fromString('ticket-2'),
      ],
      status: overrides?.status || OrderStatus.PENDING,
      createdAt: overrides?.createdAt,
    });
  };

  describe('create', () => {
    it('should create an order with provided params', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const order = createOrder({
        id: OrderId.fromString('order_123'),
        createdAt,
      });

      expect(order.getId().toString()).toBe('order_123');
      expect(order.getUserId().toString()).toBe('user-123');
      expect(order.getEventId().toString()).toBe('event-456');
      expect(order.getTicketIds()).toEqual([
        TicketId.fromString('ticket-1'),
        TicketId.fromString('ticket-2'),
      ]);
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.getCreatedAt()).toBe(createdAt);
      expect(order.isPending()).toBe(true);
      expect(order.getPaymentIntentId()).toBeUndefined();
    });

    it('should create an order with paymentIntentId', () => {
      const order = Order.create({
        userId: UserId.fromString('user-123'),
        eventId: EventId.fromString('event-456'),
        ticketIds: [TicketId.fromString('ticket-1')],
        status: OrderStatus.COMPLETED,
        paymentIntentId: 'pi_abc123',
      });

      expect(order.getPaymentIntentId()).toBe('pi_abc123');
    });

    it('should generate id and createdAt when not provided', () => {
      const order = createOrder();

      expect(order.getId()).toBeDefined();
      expect(order.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should return a copy of ticketIds', () => {
      const order = createOrder();
      const ids = order.getTicketIds();
      ids.push(TicketId.fromString('ticket-3'));

      expect(order.getTicketIds()).toEqual([
        TicketId.fromString('ticket-1'),
        TicketId.fromString('ticket-2'),
      ]);
    });

    it('should throw EmptyOrderTicketsException for empty ticketIds', () => {
      expect(() =>
        Order.create({
          userId: UserId.fromString('user-123'),
          eventId: EventId.fromString('event-456'),
          ticketIds: [],
          status: OrderStatus.PENDING,
        }),
      ).toThrow(EmptyOrderTicketsException);
    });
  });

  describe('createPending', () => {
    it('should create an order with PENDING status', () => {
      const order = Order.createPending({
        userId: UserId.fromString('user-123'),
        eventId: EventId.fromString('event-456'),
        ticketIds: [TicketId.fromString('ticket-1')],
      });

      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.isPending()).toBe(true);
    });
  });

  describe('complete', () => {
    it('should complete a pending order', () => {
      const order = createOrder();

      order.complete();

      expect(order.getStatus()).toBe(OrderStatus.COMPLETED);
      expect(order.isCompleted()).toBe(true);
    });

    it('should throw InvalidOrderStatusTransitionException when completing a completed order', () => {
      const order = createOrder();
      order.complete();

      expect(() => order.complete()).toThrow(
        InvalidOrderStatusTransitionException,
      );
    });

    it('should throw InvalidOrderStatusTransitionException when completing a cancelled order', () => {
      const order = createOrder();
      order.cancel();

      expect(() => order.complete()).toThrow(
        InvalidOrderStatusTransitionException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a pending order', () => {
      const order = createOrder();

      order.cancel();

      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
      expect(order.isCancelled()).toBe(true);
    });

    it('should cancel a completed order', () => {
      const order = createOrder();
      order.complete();

      order.cancel();

      expect(order.isCancelled()).toBe(true);
    });

    it('should throw InvalidOrderStatusTransitionException when cancelling a cancelled order', () => {
      const order = createOrder();
      order.cancel();

      expect(() => order.cancel()).toThrow(
        InvalidOrderStatusTransitionException,
      );
    });
  });

  describe('paymentIntentId', () => {
    it('should set paymentIntentId on a pending order', () => {
      const order = createOrder();

      order.setPaymentIntentId('pi_xyz789');

      expect(order.getPaymentIntentId()).toBe('pi_xyz789');
    });
  });
});
