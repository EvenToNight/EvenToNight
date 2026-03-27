import { CheckoutSessionCompletedEvent } from 'src/tickets/domain/events/checkout-session-completed.event';

describe('CheckoutSessionCompletedEvent', () => {
  const payload = { sessionId: 'sess-1', orderId: 'order-1' };

  it('should set eventType to checkout.session.completed', () => {
    const event = new CheckoutSessionCompletedEvent(payload);
    expect(event.eventType).toBe('checkout.session.completed');
  });

  it('should store the payload', () => {
    const event = new CheckoutSessionCompletedEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new CheckoutSessionCompletedEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new CheckoutSessionCompletedEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'checkout.session.completed',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
