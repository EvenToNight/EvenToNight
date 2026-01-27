import { SeedUser } from "../users/types/users.types";
import { eventsSeedData } from "./data/events.data";
import { EventToCreate } from "./types/events.types";

export function filterEvents(users: SeedUser[]): EventToCreate[] {
  const orgsIdMap: Record<string, string> = {};
    for (const user of users) {
      if (user.role === "organization") {
        orgsIdMap[user.username] = user.id;
      }
    }
    const eventsToCreate: EventToCreate[] = eventsSeedData
      .filter(e => e.creator in orgsIdMap)
      .map(e => {
        const collaboratorsIds = e.collaborators
          ?.map(username => orgsIdMap[username])
          .filter((id): id is string => !!id);

        return {
          title: e.title,
          description: e.description,
          poster: e.poster,
          tags: e.tags,
          location: e.location,
          date: e.date,
          status: e.status,
          creatorId: orgsIdMap[e.creator],
          collaboratorsIds: collaboratorsIds
        };
      });

  return eventsToCreate;
}
