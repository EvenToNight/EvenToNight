import { DataProvider } from './../../seed'
import { SeedEvent } from '../../events/types/events.types';
import { EventInteractionSeedResult, EventInteractionToInsert } from './types/event.interaction.types';
import { SeedEventInteraction } from './types/event.interaction.types';
import { filterEvent } from './events.interaction.seed.mapper';
import { insertEvent } from './services/event.interaction.service';

export class EventInteractionSeed implements DataProvider<EventInteractionSeedResult> {
    private events: SeedEvent[];
    
    constructor(events: SeedEvent[]) {
        this.events = events
    }

    async populate(): Promise<EventInteractionSeedResult> {
        const eventsToInsert: EventInteractionToInsert[] = filterEvent(this.events);
        const eventInteractions: SeedEventInteraction[] = []

        for (const event of eventsToInsert) {
            const e = await insertEvent(event);
            eventInteractions.push(e);
        }

        return { eventInteractions: eventInteractions };
    }
}