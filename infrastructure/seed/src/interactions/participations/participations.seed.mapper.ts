import { SeedUser } from "../../users/types/users.types";
import { SeedEvent } from "../../events/types/events.types";
import { ParticipationToCreate } from "./types/participation.types";
import { participationsSeedData } from "./data/participation.data";

export function filterParticipations(users: SeedUser[], events: SeedEvent[]): ParticipationToCreate[] {
    const userIdMap: Record<string, string> = {};
    for (const user of users) {
        userIdMap[user.username] = user.id;
    }
    
    const eventIdMap: Record<string, string> = {};
    for (const event of events) {
        eventIdMap[event.title] = event._id;
    }
    
    const participationsToCreate: ParticipationToCreate[] = participationsSeedData
        .filter(participation => participation.user in userIdMap && participation.event in eventIdMap)
        .map(participation => ({
            userId: userIdMap[participation.user],
            eventId: eventIdMap[participation.event],
        }));
    
    return participationsToCreate;
}