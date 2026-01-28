import { SeedUser } from "../../users/types/users.types";
import { FollowToCreate } from "../follows/types/follow.types";
import { followsSeedData } from "../follows/data/follows.data";

export function filterFollows(users: SeedUser[]): FollowToCreate[] {
    const usersIdMap: Record<string, string> = {};
    for (const user of users) {
        usersIdMap[user.username] = user.id;
    }

    const followsToCreate: FollowToCreate[] = followsSeedData
    .map(follow => ({
        followerId: usersIdMap[follow.follower],
        followedId: usersIdMap[follow.followed],
    }))
    .filter(follow => follow.followerId && follow.followedId);
    
    return followsToCreate;
}
