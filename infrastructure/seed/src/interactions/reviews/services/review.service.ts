import { execSync } from "child_process";
import { ObjectId } from "mongodb";
import { ReviewToCreate, SeedReview } from "../types/review.types";

export async function createReview(review: ReviewToCreate): Promise<SeedReview> {
    const _id = new ObjectId();
    
    const MONGO_HOST =
        process.env.INTERACTION_MONGO_URI || "mongo-interactions";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const reviewToCreate = {
        _id,
        ...review,
    };
    
    const insertCommand = `db.reviews.insertOne(${JSON.stringify(reviewToCreate)})`;
    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Review inserted: ${_id}`);

        return reviewToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert review ${_id}: ${errorMessage}`);
    }
}