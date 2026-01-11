import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_HOST
        ? `mongodb://${process.env.MONGO_HOST}:27017/eventonight-payments`
        : 'mongodb://localhost:27017/eventonight-payments',
      {
        retryWrites: true,
        w: 'majority',
      },
    ),
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
