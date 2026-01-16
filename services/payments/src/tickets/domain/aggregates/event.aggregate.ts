import { UserId } from '../value-objects/user-id.vo';
import { EventId } from '../value-objects/event-id.vo';

export class Event {
  private constructor(
    private readonly id: EventId,
    private creatorId: UserId,
  ) {}

  static create(id: EventId, creatorId: UserId): Event {
    return new Event(id, creatorId);
  }

  // Getters
  getId(): EventId {
    return this.id;
  }

  getCreatorId(): UserId {
    return this.creatorId;
  }
}
