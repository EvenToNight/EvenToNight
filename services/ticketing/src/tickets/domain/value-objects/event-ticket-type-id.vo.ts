import { EmptyEventTicketTypeIdException } from '../exceptions/empty-event-ticket-type-id.exception';
import { EntityId } from './entity-id.vo';

export class EventTicketTypeId extends EntityId<EventTicketTypeId> {
  private constructor(value: string) {
    super(value, () => new EmptyEventTicketTypeIdException());
  }

  static fromString(value: string): EventTicketTypeId {
    return new EventTicketTypeId(value);
  }
}
