import { EventSeedResult, SeedEvent } from './types/events.types';
import { filterEvents } from './events.seed.mapper';
import { DataProvider } from './../seed';
import { createEvent } from './services/events.service';
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
        const createdEvent  = await createEvent(event);
        successCount++;
        console.log(`✓ Event created: ${createdEvent._id}`);

        createdEvents.push(
          createdEvent
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
