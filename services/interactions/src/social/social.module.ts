import { Module } from '@nestjs/common';
import { FollowController } from './controllers/follow.controller';
import { FollowService } from './services/follow.service';

@Module({
  controllers: [FollowController],
  providers: [FollowService],
})
export class SocialModule {}
