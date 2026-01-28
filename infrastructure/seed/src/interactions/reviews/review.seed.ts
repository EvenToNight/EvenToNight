import { SeedEvent } from "../../events/types/events.types";
import { DataProvider } from "../../seed";
import { ReviewSeedResult } from "./types/review.types";
import { SeedUser } from "../../users/types/users.types";
import { filterReviews } from "./reviews.seed.mapper";
import { SeedReview } from "./types/review.types";
import { createReview } from "./services/review.service";

export class ReviewSeed implements DataProvider<ReviewSeedResult> {
    private events: SeedEvent[];
    private users: SeedUser[];

    constructor(events: SeedEvent[], users: SeedUser[]) {
        this.events = events;
        this.users = users;
    }
    
    async populate(): Promise<ReviewSeedResult> {
        const reviewsToCreate = filterReviews(this.users, this.events);
        const reviews: SeedReview[] = [];

        console.log(`Starting creating reviews...`);
        
        for (const review of reviewsToCreate) {
            const r = await createReview(review);
            reviews.push(r);
        }
        
        return { reviews };
    }
}