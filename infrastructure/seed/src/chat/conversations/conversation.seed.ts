import { DataProvider } from "../../seed";
import { filterConversations } from "./conversations.mapper";
import { ConversationSeedResult, SeedConversation } from "./types/conversation.types";
import { createConversation } from "./services/conversation.service";

import { SeedUser } from "../../users/types/users.types";

export class ConversationSeed implements DataProvider<ConversationSeedResult> {
    private users: SeedUser[];
    
    constructor(users: SeedUser[]) {
        this.users = users;
    }

    async populate(): Promise<ConversationSeedResult> {
        const conversationsToCreate = filterConversations(this.users);
        const conversations: SeedConversation[] = [];
        
        console.log(`Starting creating conversations...`);

        for (const conversation of conversationsToCreate) {
            const c = await createConversation(conversation);
            conversations.push(c);
        }
        
        return { conversations };
    }
    
}