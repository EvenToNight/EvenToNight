import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RabbitMQPublisher, MessagePublisher } from '@libs/ts-common';

@Injectable()
export class EventPublisher implements MessagePublisher, OnModuleInit, OnModuleDestroy {
  private readonly publisher: RabbitMQPublisher;

  constructor() {
    this.publisher = new RabbitMQPublisher('eventonight');
  }

  async onModuleInit(): Promise<void> {
    await this.publisher.connect();
  }

  async publish(event: any, routingKey: string, messageId?: string): Promise<void> {
    await this.publisher.publish(event, routingKey, messageId);
  }

  async onModuleDestroy(): Promise<void> {
    await this.publisher.disconnect();
  }
}
