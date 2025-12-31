import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryModule } from './inventory/inventory.module';
import { PaymentsModule } from './payments/payments.module';
import { TicketsModule } from './tickets/tickets.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST || 'localhost'}:27017/payments`,
    ),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // RabbitMQ client for publishing events
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASS || 'admin'}@${process.env.RABBITMQ_HOST || 'localhost'}:5672`,
          ],
          queue: 'payments_outbound_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),

    // Feature modules
    InventoryModule,
    PaymentsModule,
    TicketsModule,
    JobsModule,
  ],
})
export class AppModule {}
