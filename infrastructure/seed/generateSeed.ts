import fs from "fs";
import { usersSeedData } from "./users/data/users.data";

export async function generateUsersJSON() {
  fs.writeFileSync(
    "seed-output/users.json",
    JSON.stringify(usersSeedData, null, 2)
  );
  console.log("Users JSON generated!");
}

generateUsersJSON();
