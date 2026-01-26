import { EventSeed } from "./events/event.seed";
import { UserSeed } from "./users/user.seed";
import { execSync } from "child_process";

export interface DataProvider<T=void> {
  populate: () => Promise<T>;
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
  const { users } = await new UserSeed().populate();
  console.log("Users list:\n", JSON.stringify(users, null, 2));
  
  const { events } = await new EventSeed(users).populate();

  console.log("Events list:\n", JSON.stringify(events, null, 2));
  // Add other seeders here
}

seed();
