import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsModule } from './conversations/conversations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/eventonight`,
    ),
    ConversationsModule,
    UsersModule,
  ],
})
export class AppModule {}
