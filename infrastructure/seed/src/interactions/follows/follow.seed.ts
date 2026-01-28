import { DataProvider } from "../../seed";
import { SeedUser } from "../../users/types/users.types";
import { filterFollows } from "./follows.seed.mapper";
import { FollowSeedResult, FollowToCreate } from "./types/follow.types";
import { createFollow } from "./services/follow.service";

export class FollowSeed implements DataProvider<FollowSeedResult> {

    private users: SeedUser[];
    
    constructor(users: SeedUser[]) {
        this.users = users;
    }

    async populate(): Promise<FollowSeedResult> {
        const followToCreate: FollowToCreate[] = filterFollows(this.users);
        const createdFollows = []; 
        
        console.log(`Starting creating follows...`);

        for (const follow of followToCreate) {
            const f = await createFollow(follow);
            createdFollows.push(f);
        }
        
        return { follows: createdFollows };
    }
}