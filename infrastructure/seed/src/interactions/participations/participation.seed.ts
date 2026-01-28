import { SeedEvent } from "../../events/types/events.types";
import { DataProvider } from "../../seed";
import { SeedUser } from "../../users/types/users.types";
import { filterParticipations } from "./participations.seed.mapper";
import { ParticipationSeedResult } from "./types/participation.types";
import { SeedParticipation } from "./types/participation.types";
import { createParticipation } from "./services/participation.service";

export class ParticipationSeed implements DataProvider<ParticipationSeedResult> {
    private events: SeedEvent[];
    private users: SeedUser[];

    constructor(events: SeedEvent[], users: SeedUser[]) {
        this.events = events;
        this.users = users;
    }
    
    async populate(): Promise<ParticipationSeedResult> {
        const participationsToCreate = filterParticipations(this.users, this.events);
        const participations: SeedParticipation[] = [];
        
        console.log(`Starting creating participations...`);

        for (const participation of participationsToCreate) {
            const p = await createParticipation(participation);
            participations.push(p);
        }
        
        return { participations };
    }
    
}