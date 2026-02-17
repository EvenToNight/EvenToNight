import * as amqp from 'amqplib';
import { MessagePublisher } from './interfaces/message-publisher.interface';
import { RabbitMQConfig } from './types/messaging.types';

export class RabbitMQPublisher implements MessagePublisher {
  private connection: Awaited<ReturnType<typeof amqp.connect>> | undefined;
  private channel: Awaited<ReturnType<Awaited<ReturnType<typeof amqp.connect>>['createChannel']>> | undefined;
  private readonly exchangeName: string;

  constructor(exchangeName: string = 'eventonight') {
    this.exchangeName = exchangeName;
  }

  async connect(config: RabbitMQConfig = {}): Promise<void> {
    const user = config.user || process.env.RABBITMQ_USER || 'guest';
    const password = config.password || process.env.RABBITMQ_PASS || 'guest';
    const host = config.host || process.env.RABBITMQ_HOST || 'localhost';
    const port = config.port || process.env.RABBITMQ_PORT || '5672';

    const rabbitUrl = `amqp://${user}:${password}@${host}:${port}`;

    this.connection = await amqp.connect(rabbitUrl);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
    });
  }

  publish(event: any, routingKey: string): void {
    if (!this.channel) {
      throw new Error(
        'RabbitMQ channel not initialized. Call connect() first.',
      );
    }

    this.channel.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );
  }

  async disconnect(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
