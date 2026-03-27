import { EmptyTicketIdException } from '../exceptions/empty-ticket-id.exception';
import { EntityId } from './entity-id.vo';

export class TicketId extends EntityId<TicketId> {
  private constructor(value: string) {
    super(value, () => new EmptyTicketIdException());
  }

  static fromString(value: string): TicketId {
    return new TicketId(value);
  }
}
