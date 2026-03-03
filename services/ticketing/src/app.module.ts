import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { TicketsModule } from './tickets/tickets.module';
import { MessagingModule } from '@libs/nestjs-common';
import { AuthModule } from '@libs/nestjs-common';
import { buildMongoUrl } from '@libs/ts-common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const replicaSetNodes = parseInt(
          process.env.REPLICA_SET_NODES_NUMBER || '0',
        );
        return {
          uri:
            process.env.MONGO_URI ||
            buildMongoUrl({
              mongoHost: process.env.MONGO_HOST,
              replicaSetNodes,
              dbName: 'eventonight-ticketing',
              replicaSetName: process.env.REPLICA_SET_NAME,
            }),
          retryWrites: true,
          w: 'majority',
          readPreference: 'primaryPreferred',
          readConcern: { level: 'majority' },
          directConnection: replicaSetNodes <= 1,
        };
      },
    }),
    MessagingModule,
    TicketsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
