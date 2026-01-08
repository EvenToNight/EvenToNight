// src/integrations/user-service/user-service.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserInfoDto } from './dto/user-info.dto';

@Injectable()
export class UserServiceClient {
  private readonly logger = new Logger(UserServiceClient.name);
  private readonly userServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.userServiceUrl =
      this.configService.get<string>('USER_SERVICE_URL') ||
      'http://localhost:9000';
    this.logger.log(`User Service URL: ${this.userServiceUrl}`);
  }

  async getUserInfo(userId: string): Promise<UserInfoDto | null> {
    try {
      this.logger.debug(`Fetching user info for: ${userId}`);

      // TODO: Implement with real HTTP call using fetch/axios

      // const response = await fetch(`${this.userServiceUrl}/users/${userId}`);
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch user: ${response.statusText}`);
      // }
      // return await response.json();

      // Mock for now (kept async to match real HTTP call behavior)
      return await this.mockGetUserInfo(userId);
    } catch (error) {
      this.logger.error(`Error fetching user info for ${userId}:`, error);
      return null;
    }
  }

  // ============= MOCK METHODS (to be removed later) =============

  private async mockGetUserInfo(userId: string): Promise<UserInfoDto | null> {
    // Simulate a REST call
    const mockUsers: Record<string, UserInfoDto> = {
      user123: {
        userId: 'user123',
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=JD',
        email: 'john@example.com',
      },
      org456: {
        userId: 'org456',
        name: 'Tech Organization',
        avatar: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=TO',
        email: 'info@techorg.com',
      },
      member789: {
        userId: 'member789',
        name: 'Jane Smith',
        avatar: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=JS',
        email: 'jane@example.com',
      },
    };

    return await Promise.resolve(mockUsers[userId] || null);
  }
}
