import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './services/conversations.service';
import { ConversationsController } from './controllers/conversations.controller';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Participant, ParticipantSchema } from './schemas/participant.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Participant.name, schema: ParticipantSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UsersModule,
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
