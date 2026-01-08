import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserServiceClient } from './user-service.client';

@Module({
  imports: [ConfigModule],
  providers: [UserServiceClient],
  exports: [UserServiceClient],
})
export class UserServiceModule {}
