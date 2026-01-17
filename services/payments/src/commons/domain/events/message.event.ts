import { EventEnvelope } from './event-envelope';

export interface MessageEventPayload {
  message: string;
}

export class MessageEvent implements EventEnvelope<MessageEventPayload> {
  public readonly eventType = 'message.event';
  public readonly occurredAt: Date;

  constructor(public readonly payload: MessageEventPayload) {
    this.occurredAt = new Date();
  }

  toJSON() {
    return {
      eventType: this.eventType,
      occurredAt: this.occurredAt,
      payload: this.payload,
    };
  }
}
