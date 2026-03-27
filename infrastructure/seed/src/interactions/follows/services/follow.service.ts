import { FollowToCreate, SeedFollow } from "../types/follow.types";
import crypto from "crypto";
import { execSync } from "child_process";

export async function createFollow(follow: FollowToCreate): Promise<SeedFollow> {
    const _id = crypto.randomUUID();

    const MONGO_HOST =
        process.env.INTERACTION_MONGO_URI || "mongo-interactions";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";

    const followToCreate = {
        _id,
        ...follow,
    };

    const insertCommand = `db.follows.insertOne(${JSON.stringify(followToCreate)})`;

    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Follow inserted in interactions: ${_id}`);

        await insertFollowNotification(follow);

        return followToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert follow ${_id}: ${errorMessage}`);
    }
}

async function insertFollowNotification(follow: FollowToCreate): Promise<SeedFollow> {
    const _id = crypto.randomUUID();

    const MONGO_HOST =
        process.env.NOTIFICATION_MONGO_URI || "mongo-notifications";
    const MONGO_DB = "eventonight-notifications";

    const followToCreate = {
        _id,
        ...follow
    };

    const insertCommand = `db.follows.insertOne(${JSON.stringify(followToCreate)})`;

    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Follow inserted in notifications: ${_id}`);

        return followToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert follow ${_id}: ${errorMessage}`);
    }
}