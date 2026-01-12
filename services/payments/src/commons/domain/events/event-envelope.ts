export interface EventEnvelope<T> {
  eventType: string;
  occurredAt: Date;
  payload: T;
}
