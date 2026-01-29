import { DataProvider } from './../../seed';
import { SeedEvent } from '../../events/types/events.types';
import { SeedUser } from '../../users/types/users.types';
import { LikeSeedResult } from './types/like.types';
import { SeedLike } from './types/like.types';
import { filterLikes } from './likes.seed.mapper';
import { createLike } from './services/like.service';


export class LikeSeed implements DataProvider<LikeSeedResult> {
  private events: SeedEvent[];
  private users: SeedUser[];

  constructor(events: SeedEvent[], users: SeedUser[]) {
    this.events = events;
    this.users = users;
  }

  async populate(): Promise<LikeSeedResult> {
    const likesToCreate = filterLikes(this.users, this.events);
    const likes: SeedLike[] = [];

    console.log(`Starting creating likes...`);

    for (const like of likesToCreate) {
        const l = await createLike(like);
        likes.push(l);
    }

    return { likes };
  }
}