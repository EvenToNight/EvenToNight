import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { User, UserSchema } from './schemas/user.schema';
import { MetadataService } from './services/metadata.service';
import { MetadataController } from './controllers/metadata.controller';
import { EventModule } from 'src/events/event.module';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => UserModule),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
  exports: [MetadataService],
})
export class MetadataModule {}
