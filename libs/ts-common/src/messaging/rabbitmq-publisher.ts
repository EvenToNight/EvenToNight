import * as amqp from 'amqplib';
import { MessagePublisher } from './interfaces/message-publisher.interface';
import { RabbitMQConfig } from './types/messaging.types';

export class RabbitMQPublisher implements MessagePublisher {
  private connection: Awaited<ReturnType<typeof amqp.connect>> | undefined;
  private channel: amqp.ConfirmChannel | undefined;
  private readonly exchangeName: string;
  private savedConfig: RabbitMQConfig = {};
  private isReconnecting = false;
  private isStopped = false;

  constructor(exchangeName: string = 'eventonight') {
    this.exchangeName = exchangeName;
  }

  async connect(config: RabbitMQConfig = {}): Promise<void> {
    this.savedConfig = config;
    await this.createConnection();
  }

  private buildUrl(): string {
    const user = this.savedConfig.user || process.env.RABBITMQ_USER || 'guest';
    const password =
      this.savedConfig.password || process.env.RABBITMQ_PASS || 'guest';
    const host =
      this.savedConfig.host || process.env.RABBITMQ_HOST || 'localhost';
    const port = this.savedConfig.port || process.env.RABBITMQ_PORT || '5672';
    return `amqp://${user}:${password}@${host}:${port}`;
  }

  private async createConnection(): Promise<void> {
    this.connection = await amqp.connect(this.buildUrl());

    this.connection.on('close', () => {
      this.connection = undefined;
      this.channel = undefined;
      if (!this.isStopped) {
        this.scheduleReconnect(0);
      }
    });

    this.connection.on('error', () => {
      // 'close' will follow, handled there
    });

    await this.setupChannel();
  }

  private async setupChannel(): Promise<void> {
    if (!this.connection) return;

    this.channel = await this.connection.createConfirmChannel();

    this.channel.on('close', () => {
      this.channel = undefined;
      if (this.connection && !this.isStopped && !this.isReconnecting) {
        void this.setupChannel().catch(() => {
          // Connection is also closing; connection.on('close') will handle reconnect
        });
      }
    });

    this.channel.on('error', () => {
      // 'close' will follow, handled there
    });

    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
    });
  }

  private scheduleReconnect(attempt: number): void {
    if (this.isReconnecting || this.isStopped) return;
    this.isReconnecting = true;

    const delayMs = Math.min(1000 * Math.pow(2, attempt), 30000);

    setTimeout(() => {
      void this.createConnection()
        .then(() => {
          this.isReconnecting = false;
        })
        .catch(() => {
          this.isReconnecting = false;
          this.scheduleReconnect(attempt + 1);
        });
    }, delayMs);
  }

  publish(event: any, routingKey: string, messageId?: string): Promise<void> {
    if (!this.channel) {
      return Promise.reject(
        new Error('RabbitMQ channel not initialized. Call connect() first.'),
      );
    }

    return new Promise<void>((resolve, reject) => {
      this.channel!.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        { persistent: true, ...(messageId ? { messageId } : {}) },
        (err) => (err ? reject(err) : resolve()),
      );
    });
  }

  async disconnect(): Promise<void> {
    this.isStopped = true;
    await this.channel?.close();
    await this.connection?.close();
  }
}
