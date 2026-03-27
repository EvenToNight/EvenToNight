import { CheckoutSessionExpiredEvent } from 'src/tickets/domain/events/checkout-session-expired.event';

describe('CheckoutSessionExpiredEvent', () => {
  const payload = {
    sessionId: 'sess-1',
    orderId: 'order-1',
    expirationReason: 'timeout',
  };

  it('should set eventType to checkout.session.expired', () => {
    const event = new CheckoutSessionExpiredEvent(payload);
    expect(event.eventType).toBe('checkout.session.expired');
  });

  it('should store the payload', () => {
    const event = new CheckoutSessionExpiredEvent(payload);
    expect(event.payload).toEqual(payload);
  });

  it('should set occurredAt to a Date', () => {
    const event = new CheckoutSessionExpiredEvent(payload);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should serialize correctly with toJSON', () => {
    const event = new CheckoutSessionExpiredEvent(payload);
    const json = event.toJSON();
    expect(json).toEqual({
      eventType: 'checkout.session.expired',
      occurredAt: event.occurredAt,
      payload,
    });
  });
});
