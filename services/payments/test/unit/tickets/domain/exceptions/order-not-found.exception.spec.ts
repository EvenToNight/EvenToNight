import { OrderNotFoundException } from 'src/tickets/domain/exceptions/order-not-found-exception';

describe('OrderNotFoundException', () => {
  it('includes the order ID in the message when provided', () => {
    const err = new OrderNotFoundException('order-42');
    expect(err.message).toBe('Order with id order-42 not found');
    expect(err.name).toBe('OrderNotFoundException');
    expect(err).toBeInstanceOf(Error);
  });

  it('uses a generic message when no ID is provided', () => {
    const err = new OrderNotFoundException();
    expect(err.message).toBe('Order not found');
  });
});
