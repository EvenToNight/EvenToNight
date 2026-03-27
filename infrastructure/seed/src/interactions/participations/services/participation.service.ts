import crypto from "crypto";
import { execSync } from "child_process";
import { ParticipationToCreate, SeedParticipation } from "../types/participation.types";

export async function createParticipation(participation: ParticipationToCreate): Promise<SeedParticipation> {
    const _id = crypto.randomUUID();
    
    const MONGO_HOST =
        process.env.INTERACTION_MONGO_URI || "mongo-interactions";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const participationToCreate = {
        _id,
        ...participation,
    };

    const insertCommand = `db.participations.insertOne(${JSON.stringify(participationToCreate)})`;

    try {
        execSync(
            `mongosh "mongodb://${MONGO_HOST}:27017/${MONGO_DB}?directConnection=true" --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Participation inserted: ${_id}`);

        return participationToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert participation ${_id}: ${errorMessage}`);
    }
}