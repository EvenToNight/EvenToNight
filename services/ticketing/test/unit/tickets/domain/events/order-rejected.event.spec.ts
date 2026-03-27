import { OrderRejectedEvent } from 'src/tickets/domain/events/order-rejected.event';

describe('OrderRejectedEvent', () => {
  const payload = {
    orderId: 'order-1',
    userId: 'user-1',
    eventId: 'event-1',
  };

  it('should set eventType to payments.order.rejected', () => {
    const event = new OrderRejectedEvent(payload);
    expect(event.eventType).toBe('payments.order.rejected');
  });

  it('should store the payload', () => {
    const event = new OrderRejectedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new OrderRejectedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new OrderRejectedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'payments.order.rejected',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
