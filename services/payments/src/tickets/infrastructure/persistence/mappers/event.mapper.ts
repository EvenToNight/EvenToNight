import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventDocument } from '../schemas/event.schema';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';

export class EventMapper {
  static toDomain(document: EventDocument): Event {
    return Event.create(
      EventId.fromString(document._id.toString()),
      UserId.fromString(document.creatorId),
    );
  }

  static toPersistence(event: Event): Partial<EventDocument> {
    return {
      _id: event.getId() as any,
      creatorId: event.getCreatorId().toString(),
    };
  }
}
