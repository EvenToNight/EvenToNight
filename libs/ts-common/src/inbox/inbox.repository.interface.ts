import { InboxEntry } from './inbox.types';

export interface InboxRepository {
  save(entry: InboxEntry): Promise<void>;
  find(key: string): Promise<InboxEntry | null>;
}

export const INBOX_REPOSITORY = Symbol('InboxRepository');
