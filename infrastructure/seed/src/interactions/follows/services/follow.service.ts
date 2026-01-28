import { FollowToCreate, SeedFollow } from "../types/follow.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function createFollow(follow: FollowToCreate): Promise<SeedFollow> {
    const _id = crypto.randomUUID();

    const DOCKER_CONTAINER =
        process.env.INTERACTION_MONGO_URI || "eventonight-mongo-interactions-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const followToCreate = {
        _id,
        ...follow,
    };

    const insertCommand = `db.follows.insertOne(${JSON.stringify(followToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Follow inserted: ${_id}`);

        return followToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert follow ${_id}: ${errorMessage}`);
    }
}