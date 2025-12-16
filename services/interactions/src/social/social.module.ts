import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowController } from './controllers/follow.controller';
import { FollowService } from './services/follow.service';
import { Follow, FollowSchema } from './model/schemas/follow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class SocialModule {}
