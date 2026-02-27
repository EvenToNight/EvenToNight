import { ORDER_REPOSITORY } from 'src/tickets/domain/repositories/order.repository.interface';

describe('OrderRepository', () => {
  it('should export ORDER_REPOSITORY token', () => {
    expect(typeof ORDER_REPOSITORY).toBe('symbol');
    expect(ORDER_REPOSITORY.toString()).toBe('Symbol(ORDER_REPOSITORY)');
  });
});
