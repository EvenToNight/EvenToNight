import { EmptyOrderIdException } from '../exceptions/empty-order-id.exception';
import { EntityId } from './entity-id.vo';

export class OrderId extends EntityId<OrderId> {
  private constructor(value: string) {
    super(value, () => new EmptyOrderIdException());
  }

  static fromString(value: string): OrderId {
    return new OrderId(value);
  }
}
