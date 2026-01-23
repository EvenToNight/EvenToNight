import { UserId } from '../value-objects/user-id.vo';
import { EventId } from '../value-objects/event-id.vo';
import { EventStatus } from '../value-objects/event-status.vo';

export interface EventCreateParams {
  id: EventId;
  creatorId: UserId;
  date: Date;
  status: EventStatus;
}

export class Event {
  private constructor(
    private readonly id: EventId,
    private creatorId: UserId,
    private date: Date,
    private status: EventStatus,
  ) {}

  static create(params: EventCreateParams): Event {
    return new Event(params.id, params.creatorId, params.date, params.status);
  }

  // Getters
  getId(): EventId {
    return this.id;
  }

  getCreatorId(): UserId {
    return this.creatorId;
  }

  getDate(): Date {
    return this.date;
  }

  getStatus(): EventStatus {
    return this.status;
  }
}
