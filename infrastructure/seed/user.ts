import { DataProvider } from './seed';
import axios from "axios";
import { usersSeedData } from "./users/data/users.data.js";

interface LoginResponse {
  id: string;
  accessToken: string;
}

const USER_HOST = process.env.USER_HOST!
export class UserSeed implements DataProvider {
  async populate(): Promise<void> {
  console.log(`Register users to ${USER_HOST}...`);
  let successCount = 0;
  let errorCount = 0;
  console.log(await axios.get(`${USER_HOST}/health`));
  for (const user of usersSeedData) {
    try {
      const body = {
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role
      };
      const res = await axios.post<LoginResponse>(`${USER_HOST}/login`, body);
      console.log('res', res.data.accessToken);
      console.log(`✓ Registered: ${user.username}`);
      successCount++;
    } catch (error) {
      console.log('error', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ Failed to register ${user.username}:`, errorMessage);
      errorCount++;
    }
  }

  console.log(`\nSeeding completed: ${successCount} success, ${errorCount} failed`);

    }
}