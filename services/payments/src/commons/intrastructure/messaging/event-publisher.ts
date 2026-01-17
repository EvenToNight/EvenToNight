import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private connection!: amqp.ChannelModel;
  private channel!: amqp.Channel;

  async onModuleInit() {
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASS || 'guest';
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    const rabbitUrl = `amqp://${user}:${pass}@${host}:${port}`;
    this.connection = await amqp.connect(rabbitUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange('eventonight', 'topic', {
      durable: true,
    });
  }

  publish(event: any, routingKey: string) {
    this.channel.publish(
      'eventonight',
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
