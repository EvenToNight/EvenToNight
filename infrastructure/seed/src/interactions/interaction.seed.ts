import { DataProvider } from './../seed'
import { SeedUser } from "../users/types/users.types";
import { SeedEvent } from '../events/types/events.types';
import { InteractionSeedResult } from './types/interactions.types';
import { SeedInteraction } from './types/interactions.types';
import { EventInteractionSeed } from './events/event.interaction.seed';

export class InteractionSeed implements DataProvider<InteractionSeedResult> {
    private users: SeedUser[];
    private events: SeedEvent[];

    constructor(users: SeedUser[], events: SeedEvent[]) {
        this.users = users
        this.events = events
    }

    async populate(): Promise<InteractionSeedResult> {
        const interactions: SeedInteraction[] = [];
        interactions.push(
            await new EventInteractionSeed(this.events).populate()
        )
        return { interactions: interactions };
    }
}