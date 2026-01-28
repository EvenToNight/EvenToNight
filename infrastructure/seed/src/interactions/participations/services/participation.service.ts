import crypto from "crypto";
import { execSync } from "child_process";
import { ParticipationToCreate, SeedParticipation } from "../types/participation.types";

export async function createParticipation(participation: ParticipationToCreate): Promise<SeedParticipation> {
    const _id = crypto.randomUUID();
    
    const DOCKER_CONTAINER =
        process.env.INTERACTION_MONGO_URI || "eventonight-mongo-interactions-1";
    const MONGO_DB = process.env.MONGO_DB || "eventonight";
    
    const participationToCreate = {
        _id,
        ...participation,
    };

    const insertCommand = `db.participations.insertOne(${JSON.stringify(participationToCreate)})`;

    try {
        execSync(
            `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
            { stdio: "pipe" }
        );
        console.log(`[DB] Participation inserted: ${_id}`);

        return participationToCreate;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to insert participation ${_id}: ${errorMessage}`);
    }
}