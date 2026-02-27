import { EmptyUserIdException } from '../exceptions/empty-user-id.exception';
import { EntityId } from './entity-id.vo';

export class UserId extends EntityId<UserId> {
  private constructor(value: string) {
    super(value, () => new EmptyUserIdException());
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }
}
