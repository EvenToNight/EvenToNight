import { EmptyEventIdException } from '../exceptions/empty-event-id.exception';
import { EntityId } from './entity-id.vo';

export class EventId extends EntityId<EventId> {
  private constructor(value: string) {
    super(value, () => new EmptyEventIdException());
  }

  static fromString(value: string): EventId {
    return new EventId(value);
  }
}
