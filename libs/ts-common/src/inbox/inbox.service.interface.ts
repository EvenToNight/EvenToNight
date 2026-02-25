export interface InboxService {
    isProcessed(key: string): Promise<boolean>;
    markAsProcessed(key: string): Promise<void>;
}

export const INBOX_SERVICE = Symbol('InboxService');
