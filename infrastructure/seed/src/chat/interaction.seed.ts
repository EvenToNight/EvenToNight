import { DataProvider } from './../seed'
import { SeedUser } from "../users/types/users.types";
import { ChatSeedResult, SeedChat } from './types/chat.types';
import { SeedEvent } from '../events/types/events.types';

export class ChatSeed implements DataProvider<ChatSeedResult> {
    private users: SeedUser[];

    constructor(users: SeedUser[], events: SeedEvent[]) {
        this.users = users
    }

    async populate(): Promise<ChatSeedResult> {
        const interactions: SeedChat[] = [];
        
        return { interactions: interactions };
    }
}