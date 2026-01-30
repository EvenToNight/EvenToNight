import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivityController } from './controllers/user-activity.controller';
import { FollowController } from './controllers/follow.controller';
import { FollowService } from './services/follow.service';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { EventModule } from 'src/events/event.module';
import { MetadataModule } from 'src/metadata/metadata.module';
import { RabbitMqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    EventModule,
    forwardRef(() => MetadataModule),
    RabbitMqModule,
  ],
  controllers: [FollowController, UserActivityController],
  providers: [FollowService],
  exports: [FollowService],
})
export class UserModule {}
