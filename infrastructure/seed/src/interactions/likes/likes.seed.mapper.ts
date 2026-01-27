import { LikeToCreate } from "./types/like.types";
import { SeedUser } from "../../users/types/users.types";
import { SeedEvent } from "../../events/types/events.types";
import { likesSeedData } from "./data/likes.data";

export function filterLikes(users: SeedUser[], events: SeedEvent[]): LikeToCreate[] {
    const userIdMap: Record<string, string> = {};
    for (const user of users) {
        userIdMap[user.username] = user.id;
    }
    
    const eventIdMap: Record<string, string> = {};
    for (const event of events) {
        eventIdMap[event.title] = event._id;
    }

    const likesToCreate: LikeToCreate[] = likesSeedData
      .filter(like => like.user in userIdMap && like.event in eventIdMap)
      .map(like => ({
        userId: userIdMap[like.user],
        eventId: eventIdMap[like.event]
      }));

    return likesToCreate;
}