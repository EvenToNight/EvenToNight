import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventPublisher } from './event-publisher';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASS || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:5672`,
          ],
          queue: 'payments_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [EventPublisher],
  exports: [EventPublisher, ClientsModule],
})
export class MessagingModule {}
