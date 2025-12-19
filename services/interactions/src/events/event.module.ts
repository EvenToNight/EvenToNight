import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './schemas/like.schema';
import { LikeService } from './services/like.service';
import { LikeController } from './controllers/like.controller';
import { MetadataModule } from 'src/metadata/metadata.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    MetadataModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class EventModule {}
