import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TicketService } from './services/ticket.service';
import { TicketController } from './controllers/ticket.controller';
import { TicketPublisher } from './controllers/ticket.publisher';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASS || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:5672`,
          ],
          queue: 'payments_outbound_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketPublisher],
  exports: [TicketService, TicketPublisher],
})
export class TicketsModule {}
