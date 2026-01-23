import { UserSeed } from "./user";
import { execSync } from "child_process";

export interface DataProvider {
  populate: () => Promise<void>;
}

const DOCKER_CONTAINER =
  process.env.DOCKER_CONTAINER || "eventonight-frontend-environment-mongo-1";
const MONGO_DB = process.env.MONGO_DB || "eventonight-payments";

function dropDatabase() {
  console.log(`Dropping database ${MONGO_DB} of ${DOCKER_CONTAINER}...`);
  try {
    execSync(
      `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval "db.dropDatabase()"`,
      { stdio: "inherit" }
    );
    console.log("Database dropped and fully cleaned.\n");
  } catch (error) {
    console.error("Error dropping database:", error);
    process.exit(1);
  }
}

async function seed() {
  dropDatabase();
  await new UserSeed().populate();
  // Add other seeders here
}

seed();