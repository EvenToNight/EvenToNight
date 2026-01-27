import { SeedEvent } from "../../events/types/events.types";
import { SeedUser } from "../../users/types/users.types";
import { ReviewToCreate } from "./types/review.types";
import { reviewsSeedData } from "./data/reviews.data";

export function filterReviews(users: SeedUser[], events: SeedEvent[]): ReviewToCreate[] {
    const userIdMap: Record<string, string> = {};
    for (const user of users) {
        userIdMap[user.username] = user.id;
    }

    const eventIdMap: Record<string, string> = {};
    for (const event of events) {
        eventIdMap[event.title] = event._id;
    }
    
    const reviewsToCreate: ReviewToCreate[] = reviewsSeedData
        .filter(review => review.user in userIdMap && review.event in eventIdMap)
        .map(review => ({
            userId: userIdMap[review.user],
            eventId: eventIdMap[review.event],
            creatorId: userIdMap[review.creator],
            collaboratorIds: review.collaborators.map((collab: string) => userIdMap[collab]).filter((id: string) => id !== undefined),
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        }));

    return reviewsToCreate;
}