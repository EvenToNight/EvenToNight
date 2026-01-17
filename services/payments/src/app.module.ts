import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { MessagingModule } from './commons/intrastructure/messaging/messaging.module';
import { AuthModule } from './commons/infrastructure/auth';

@Module({
  imports: [
    MongooseModule.forRoot(
      // Single-node (development): mongodb://localhost:27017/eventonight-payments?replicaSet=rs0
      // Multi-node (production): mongodb://mongo-payments:27017,mongo-payments-2:27017,mongo-payments-3:27017/eventonight-payments?replicaSet=rs0
      process.env.MONGO_HOST
        ? `mongodb://${process.env.MONGO_HOST}:27017/eventonight-payments?replicaSet=rs0`
        : `mongodb://localhost:27017/eventonight-payments`,
      {
        retryWrites: true,
        w: 'majority',
        readPreference: 'primaryPreferred', // Read from primary, fallback to secondary
        directConnection: true,
        // !process.env.MONGO_REPLICA_SET_HOSTS,
      },
    ),
    MessagingModule,
    TicketsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
