import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RabbitMQPublisher } from '../../../ts-common/src/messaging/rabbitmq-publisher';
import { MessagePublisher } from '../../../ts-common/src/messaging/interfaces/message-publisher.interface';

@Injectable()
export class EventPublisher implements MessagePublisher, OnModuleInit, OnModuleDestroy {
  private readonly publisher: RabbitMQPublisher;

  constructor() {
    this.publisher = new RabbitMQPublisher('eventonight');
  }

  async onModuleInit(): Promise<void> {
    await this.publisher.connect();
  }

  publish(event: any, routingKey: string): void {
    this.publisher.publish(event, routingKey);
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher.disconnect();
  }
}
