import { DataProvider } from '../seed'
import { SeedUser } from "../users/types/users.types";
import { ChatSeedResult, SeedChat } from './types/chat.types';
import { SeedEvent } from '../events/types/events.types';
import { ConversationSeed } from './conversations/conversation.seed';

export class ChatSeed implements DataProvider<ChatSeedResult> {
    private users: SeedUser[];

    constructor(users: SeedUser[]) {
        this.users = users
    }

    async populate(): Promise<ChatSeedResult> {
        const chat: SeedChat[] = [];
        chat.push(
            await new ConversationSeed(this.users).populate()
        )
        return { chat: chat };
    }
}