import { OrderId } from 'src/tickets/domain/value-objects/order-id.vo';
import { EmptyOrderIdException } from 'src/tickets/domain/exceptions/empty-order-id.exception';

describe('OrderId', () => {
  it('should create from valid string', () => {
    const id = OrderId.fromString('order_123');
    expect(id.getValue()).toBe('order_123');
    expect(id.toString()).toBe('order_123');
  });

  it('should throw EmptyOrderIdException for empty string', () => {
    expect(() => OrderId.fromString('')).toThrow(EmptyOrderIdException);
  });

  it('should throw EmptyOrderIdException for whitespace', () => {
    expect(() => OrderId.fromString('   ')).toThrow(EmptyOrderIdException);
  });

  it('should return true for equal ids', () => {
    const a = OrderId.fromString('order_1');
    const b = OrderId.fromString('order_1');
    expect(a.equals(b)).toBe(true);
  });

  it('should return false for different ids', () => {
    const a = OrderId.fromString('order_1');
    const b = OrderId.fromString('order_2');
    expect(a.equals(b)).toBe(false);
  });
});
