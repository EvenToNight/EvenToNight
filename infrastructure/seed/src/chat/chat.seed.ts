import { DataProvider } from '../seed'
import { SeedUser } from "../users/types/users.types";
import { ChatSeedResult, SeedChat } from './types/chat.types';
import { ConversationSeed } from './conversations/conversation.seed';
import { SeedConversation } from './conversations/types/conversation.types';
import { ParticipantSeed } from './participants/participant.seed';
import { MessageSeed } from './messages/message.seed';

export class ChatSeed implements DataProvider<ChatSeedResult> {
    private users: SeedUser[];

    constructor(users: SeedUser[]) {
        this.users = users
    }

    async populate(): Promise<ChatSeedResult> {
        const chat: SeedChat[] = [];
        let conversations: SeedConversation[] = []; 
        chat.push(
            { conversations } = await new ConversationSeed(this.users).populate()
        )
        chat.push(
            await new ParticipantSeed(conversations, this.users).populate()
        )
        chat.push(
            await new MessageSeed(conversations).populate()
        )
        
        return { chat: chat };
    }
}