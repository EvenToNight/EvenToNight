import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { TicketsModule } from './tickets/tickets.module';
import { MessagingModule } from './commons/intrastructure/messaging/messaging.module';
import { AuthModule } from './commons/infrastructure/auth';
import { buildMongoUrl } from './libs/ts-common/src/database/mongodb/mongodb.utils';

const replicaSetNodes = parseInt(process.env.REPLICA_SET_NODES_NUMBER || '0');

@Module({
  imports: [
    MongooseModule.forRoot(
      buildMongoUrl({
        mongoHost: process.env.MONGO_HOST,
        replicaSetNodes: replicaSetNodes,
        dbName: 'eventonight-payments',
        replicaSetName: process.env.REPLICA_SET_NAME,
      }),
      {
        retryWrites: true,
        w: 'majority',
        readPreference: 'primaryPreferred',
        directConnection: replicaSetNodes <= 1,
      },
    ),
    MessagingModule,
    TicketsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
