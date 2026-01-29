import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

export interface RabbitMqConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKeys: string[];
}

@Injectable()
export class RabbitMqPublisherService implements OnModuleDestroy {
  private channelWrapper: ChannelWrapper;
  private exchange: string;

  async initialize(config: RabbitMqConfig): Promise<void> {
    this.exchange = config.exchange;

    const connection = amqp.connect([config.url]);

    this.channelWrapper = connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        // Assert exchange
        await channel.assertExchange(config.exchange, 'topic', {
          durable: true,
        });

        // Assert queue
        await channel.assertQueue(config.queue, {
          durable: true,
        });

        // Bind routing keys
        for (const key of config.routingKeys) {
          await channel.bindQueue(config.queue, config.exchange, key);
        }
      },
    });

    console.log('✅ RabbitMQ Publisher initialized');
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
  }

  async publishEvent(routingKey: string, payload: any): Promise<void> {
    try {
      const message = {
        eventType: routingKey,
        occurredAt: new Date().toISOString(),
        payload,
      };

      await this.channelWrapper.publish(this.exchange, routingKey, message);
      console.log(`📤 Published event with routing key: ${routingKey}`);
    } catch (error) {
      console.error(`❌ Error publishing event ${routingKey}:`, error);
      throw error;
    }
  }
}
