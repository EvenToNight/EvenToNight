import { LikeToCreate, SeedLike } from "../types/like.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function createLike(like: LikeToCreate): Promise<SeedLike> {
    const _id = crypto.randomUUID();
    
    const MONGO_HOST =
        process.env.INTERACTION_MONGO_URI || "mongo-interactions";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const likeToCreate = {
        _id,
        ...like,
    };

    const insertCommand = `db.likes.insertOne(${JSON.stringify(likeToCreate)})`;

    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Like inserted: ${_id}`);

        return likeToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert like ${_id}: ${errorMessage}`);
    }
}
