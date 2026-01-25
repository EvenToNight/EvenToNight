import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventDocument } from '../schemas/event.schema';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';

export class EventMapper {
  static toDomain(document: EventDocument): Event {
    return Event.create({
      id: EventId.fromString(document._id.toString()),
      creatorId: UserId.fromString(document.creatorId),
      date: document.date,
      status: EventStatus.fromString(document.status),
    });
  }

  static toPersistence(event: Event): Partial<EventDocument> {
    return {
      _id: event.getId() as any,
      creatorId: event.getCreatorId().toString(),
      date: event.getDate(),
      status: event.getStatus().toString(),
    };
  }
}
