import { EventEnvelope } from "../events/event-envelope";

export interface OutboxService {
  addEvent(event: EventEnvelope<unknown>, routingKey: string): Promise<void>;
}

export const OUTBOX_SERVICE = Symbol('OutboxService');
