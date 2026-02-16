import { execSync } from "child_process";

/**
 * Builds the appropriate MongoDB connection string based on replica set detection
 * @param dockerContainer - The docker container name
 * @param database - The database name
 * @returns The connection string to use with mongosh
 */
export function buildMongoConnectionString(
    dockerContainer: string,
    database: string
): string {
    // Detect if replica set is enabled
    let isReplicaSet = false;
    let replicaSetName = "rs0";

    try {
        const rsStatusOutput = execSync(
            `docker exec ${dockerContainer} mongosh --quiet --eval 'rs.status().set'`,
            { stdio: "pipe" }
        ).toString().trim();

        if (rsStatusOutput && rsStatusOutput !== "undefined") {
            isReplicaSet = true;
            replicaSetName = rsStatusOutput;
        }
    } catch {
        // Not a replica set or rs.status() failed
        isReplicaSet = false;
    }

    // Build connection string based on replica set detection
    return isReplicaSet
        ? `mongodb://localhost:27017/${database}?replicaSet=${replicaSetName}`
        : database;
}
