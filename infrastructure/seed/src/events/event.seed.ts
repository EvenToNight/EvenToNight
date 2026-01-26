import path from 'path';
import { EventSeedResult, SeedEvent } from './types/events.types';
import { filterEvents } from './events.seed.mapper';
import { DataProvider } from './../seed';
import { createEvent, createMockEvent } from './services/events.service';
import { MEDIA_HOST } from './../config/env';
import { removeUndefined } from './../utils';
import { SeedUser } from '../users/types/users.types';

export class EventSeed implements DataProvider<EventSeedResult> {
  private users: SeedUser[];

  constructor(users: SeedUser[]) {
    this.users = users
  }
  async populate(): Promise<EventSeedResult> {
    const createdEvents: SeedEvent[] = [];
    const eventsToCreate = filterEvents(this.users);
    let successCount = 0;
    let errorCount = 0;
    console.log(`Starting creating events...`);
    
    for (const event of eventsToCreate) {
      try {
        const posterPath = event.poster ? path.resolve("events/data/posters", event.poster) : undefined;
        // const { eventId } = await createEvent(event, posterPath);
        const { eventId } = await createMockEvent(event, posterPath);
        successCount++;
        console.log(`✓ Event created: ${eventId}`);

        const posterUrl = posterPath ? `http://media.${HOST}/${eventId}/${path.basename(posterPath)}` : undefined;
        
        createdEvents.push(
          removeUndefined({
            id: eventId,
            ...event,
            poster: posterUrl
          }) as SeedEvent
        );

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Failed to create event:`, errorMessage);
      }
      
    }
    console.log(`\nEvents seeding completed: ${successCount} success, ${errorCount} failed`);

    return { events: createdEvents };
    }
}
