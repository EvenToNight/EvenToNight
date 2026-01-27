import { execSync } from "child_process";
import { ObjectId } from "mongodb";
import { ReviewToCreate, SeedReview } from "../types/review.types";

export async function createReview(review: ReviewToCreate): Promise<SeedReview> {
    const _id = new ObjectId();
    
    const DOCKER_CONTAINER =
        process.env.INTERACTION_MONGO_URI || "eventonight-mongo-interactions-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const reviewToCreate = {
        _id,
        ...review,
    };
    
    const insertCommand = `db.reviews.insertOne(${JSON.stringify(reviewToCreate)})`;
    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Review inserted: ${_id}`);

        return reviewToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert review ${_id}: ${errorMessage}`);
    }
}