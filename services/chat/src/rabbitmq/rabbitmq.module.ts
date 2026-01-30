import { Module } from '@nestjs/common';
import { RabbitMqPublisherService } from './rabbitmq-publisher.service';

@Module({
  providers: [RabbitMqPublisherService],
  exports: [RabbitMqPublisherService],
})
export class RabbitMqModule {}
