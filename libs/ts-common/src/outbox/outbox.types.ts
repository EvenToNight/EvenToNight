export interface OutboxEntry {
  id: string;
  eventType: string;
  payload: string;
  occurredAt: Date;
  processedAt: Date | null;
}

export interface OutboxDocument {
  _id: string;
  eventType: string;
  payload: string;
  occurredAt: Date;
  processedAt: Date | null;
}
