import { DataProvider } from '../seed';
import { usersSeedData } from "./data/users.data";
import { registerUser, updateAvatar, updateUser } from './services/users.service';
import { UserSeedInput, UserSeedSchema } from './schemas/user.schema';
import { USERS_BASE_URL } from './../config/env';
import { UserSeedResult, SeedUser } from './types/users.types';
import { removeUndefined } from './../utils';
import path from 'path';
import { toSeedUser } from './users.seed.mapper';
import { DEFAULT_AVATAR } from './data/users.data';

export class UserSeed implements DataProvider<UserSeedResult> {
  async populate(): Promise<UserSeedResult> {
    const users: SeedUser[] = [];
    let successCount = 0;
    let errorCount = 0;
    console.log(`Register users to ${USERS_BASE_URL}...`);
    
    //console.log(await axios.get(`${USER_HOST}/health`));

    for (const user of usersSeedData) {
      try {
        const parsedUser: UserSeedInput = UserSeedSchema.parse(user);
        const { userId, token } = await registerUser(parsedUser);
        await updateUser(userId, parsedUser, token)

        if(user.avatar && user.avatar != DEFAULT_AVATAR) {
          const avatarPath = path.resolve("src/users/data/avatars", `${user.avatar}`);
          const avatarResult = await updateAvatar(userId, token, avatarPath);
          parsedUser.avatar = avatarResult.avatarUrl;
        }

        users.push(removeUndefined(toSeedUser(parsedUser, userId)) as SeedUser);
        
        successCount++;
        console.log(`✓ User ${user.username} registered and updated`);

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`✗ Failed to register/update ${user.username}:`, errorMessage);
      }
      
    }
    console.log(`\nUsers seeding completed: ${successCount} success, ${errorCount} failed`);

    return { users };
    }
}
