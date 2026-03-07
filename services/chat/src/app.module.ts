import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsModule } from './conversations/conversations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './common/auth';
import { DatabaseModule } from './common/database';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST}:27017/eventonight?replicaSet=rs0`,
      {
        directConnection: true,
      },
    ),
    AuthModule,
    DatabaseModule,
    RabbitMqModule,
    ConversationsModule,
    UsersModule,
  ],
})
export class AppModule {}
