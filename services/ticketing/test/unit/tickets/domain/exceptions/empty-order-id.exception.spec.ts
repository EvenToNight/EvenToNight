import { EmptyOrderIdException } from 'src/tickets/domain/exceptions/empty-order-id.exception';

describe('EmptyOrderIdException', () => {
  it('should create with correct message and name', () => {
    const error = new EmptyOrderIdException();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('EmptyOrderIdException');
    expect(error.message).toBe('OrderId cannot be empty');
  });
});
