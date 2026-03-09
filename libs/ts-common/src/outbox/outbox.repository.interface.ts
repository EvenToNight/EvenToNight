import type { OutboxEntry } from './outbox.types';

export interface OutboxRepository {
  save(entry: OutboxEntry): Promise<void>;
  findUnprocessed(limit: number): Promise<OutboxEntry[]>;
  markProcessed(id: string): Promise<void>;
  deleteProcessedBefore(date: Date): Promise<number>;
}

export const OUTBOX_REPOSITORY = Symbol('OutboxRepository');
