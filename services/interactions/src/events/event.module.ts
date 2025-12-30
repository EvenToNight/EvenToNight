import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './schemas/like.schema';
import { LikeService } from './services/like.service';
import { LikeController } from './controllers/like.controller';
import { MetadataModule } from 'src/metadata/metadata.module';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { OrganizationController } from './controllers/organization.controller';
import {
  Participation,
  ParticipationSchema,
} from './schemas/participation.schema';
import { ParticipationService } from './services/participation.service';
import { ParticipationController } from './controllers/participant.controller';
import { ParticipationConsumer } from './controllers/participant.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Participation.name, schema: ParticipationSchema },
    ]),
    MetadataModule,
  ],
  controllers: [
    LikeController,
    ReviewController,
    OrganizationController,
    ParticipationController,
    ParticipationConsumer,
  ],
  providers: [LikeService, ReviewService, ParticipationService],
  exports: [LikeService, ReviewService, ParticipationService],
})
export class EventModule {}
