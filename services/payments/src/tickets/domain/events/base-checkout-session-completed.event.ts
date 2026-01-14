import { EventEnvelope } from '../../../commons/domain/events/event-envelope';
import { IsString, IsNotEmpty } from 'class-validator';

// TODO: evalute to putt validation in all events payloads
export class BaseCheckoutSessionCompletedEventPayload {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  orderId: string;
}

export class BaseCheckoutSessionCompletedEvent implements EventEnvelope<BaseCheckoutSessionCompletedEventPayload> {
  public readonly eventType = 'base.checkout.session.completed';
  public readonly occurredAt: Date;

  constructor(
    public readonly payload: BaseCheckoutSessionCompletedEventPayload,
  ) {
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
