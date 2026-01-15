import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './services/users.service';
import { UserConsumer } from './consumers/users.consumer';
import { User, UserSchema } from './schemas/user.schema';
import {
  Participant,
  ParticipantSchema,
} from 'src/conversations/schemas/participant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [UserConsumer],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
