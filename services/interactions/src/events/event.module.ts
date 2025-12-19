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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    MetadataModule,
  ],
  controllers: [LikeController, ReviewController, OrganizationController],
  providers: [LikeService, ReviewService],
  exports: [LikeService, ReviewService],
})
export class EventModule {}
