//TODO: date as string? Data.toISOString() in tests?
export interface EventEnvelope<T> {
  eventType: string;
  occurredAt: Date;
  payload: T;
}
