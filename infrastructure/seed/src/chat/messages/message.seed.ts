import { DataProvider } from '../../seed';
import { SeedConversation } from '../conversations/types/conversation.types';
import { filterMessages } from './messages.mapper';
import { MessageSeedResult } from './types/message.types';
import { insertMessage } from './services/message.service';

export class MessageSeed implements DataProvider<MessageSeedResult> {

    private conversations: SeedConversation[];

    constructor(conversations: SeedConversation[]) {
        this.conversations = conversations;
    }

    async populate(): Promise<MessageSeedResult> {
        const messagesToInsert = filterMessages(this.conversations);
        const messages = [];
        for (const message of messagesToInsert) {
            const m = await insertMessage(message);
            messages.push(m);
        }
        return { messages };
    }
} 