export interface LikeToCreate {
    eventId: string;
    userId: string;
}

export type SeedLike = LikeToCreate & {
    _id: string;
};

export interface LikeSeedResult {
    likes: SeedLike[];
}