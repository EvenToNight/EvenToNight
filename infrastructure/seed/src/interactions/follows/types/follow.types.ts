export interface FollowToCreate {
    followerId: string;
    followedId: string;
}

export type SeedFollow = FollowToCreate & {
    _id: string;
};

export interface FollowSeedResult {
    follows: SeedFollow[];
}