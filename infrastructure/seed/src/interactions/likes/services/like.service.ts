import { LikeToCreate, SeedLike } from "../types/like.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function createLike(like: LikeToCreate): Promise<SeedLike> {
    const _id = crypto.randomUUID();
    
    const DOCKER_CONTAINER =
        process.env.INTERACTION_MONGO_URI || "eventonight-mongo-interactions-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const likeToCreate = {
        _id,
        ...like,
    };

    const insertCommand = `db.likes.insertOne(${JSON.stringify(likeToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Like inserted: ${_id}`);

        return likeToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert like ${_id}: ${errorMessage}`);
    }
}
