import { OrderConfirmedEvent } from 'src/tickets/domain/events/order-confirmed.event';

describe('OrderConfirmedEvent', () => {
  const payload = {
    orderId: 'order-1',
    userId: 'user-1',
    eventId: 'event-1',
  };

  it('should set eventType to payments.order.confirmed', () => {
    const event = new OrderConfirmedEvent(payload);
    expect(event.eventType).toBe('payments.order.confirmed');
  });

  it('should store the payload', () => {
    const event = new OrderConfirmedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new OrderConfirmedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new OrderConfirmedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'payments.order.confirmed',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
