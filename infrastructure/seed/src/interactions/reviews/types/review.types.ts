import { ObjectId } from "mongodb";

export interface ReviewToCreate {
    eventId: string;
    userId: string;
    creatorId: string;
    collaboratorIds: string[];
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export type SeedReview = ReviewToCreate & {
    _id: ObjectId;
};

export interface ReviewSeedResult {
    reviews: SeedReview[];
}