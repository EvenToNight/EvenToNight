import { UserId } from '../value-objects/user-id.vo';
import { EventId } from '../value-objects/event-id.vo';
import { EventStatus } from '../value-objects/event-status.vo';

export interface EventCreateParams {
  id: EventId;
  creatorId: UserId;
  date?: Date;
  title?: string;
  status: EventStatus;
}

export class Event {
  private constructor(
    private readonly id: EventId,
    private creatorId: UserId,
    private status: EventStatus,
    private date?: Date,
    private title?: string,
  ) {}

  static create(params: EventCreateParams): Event {
    return new Event(
      params.id,
      params.creatorId,
      params.status,
      params.date,
      params.title,
    );
  }

  // Getters
  getId(): EventId {
    return this.id;
  }

  getCreatorId(): UserId {
    return this.creatorId;
  }

  getDate(): Date | undefined {
    return this.date;
  }

  getStatus(): EventStatus {
    return this.status;
  }

  getTitle(): string | undefined {
    return this.title;
  }
}
