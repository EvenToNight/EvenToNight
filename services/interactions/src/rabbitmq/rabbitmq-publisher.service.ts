import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';

export interface LikeCreatedEvent {
  creatorId: string;
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  userAvatar: string;
}

export interface FollowCreatedEvent {
  followedId: string;
  followerId: string;
  followerName: string;
  followerAvatar: string;
}

export interface FollowDeletedEvent {
  followedId: string;
  followerId: string;
}

export interface ReviewCreatedEvent {
  creatorId: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
}

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

  initialize(config: RabbitMqConfig): void {
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

  async publishLikeCreated(event: LikeCreatedEvent): Promise<void> {
    await this.publishEvent('interactions.like.created', event);
  }

  async publishFollowCreated(event: FollowCreatedEvent): Promise<void> {
    await this.publishEvent('interactions.follow.created', event);
  }

  async publishFollowDeleted(event: FollowDeletedEvent): Promise<void> {
    await this.publishEvent('interactions.follow.deleted', event);
  }

  async publishReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    await this.publishEvent('interactions.review.created', event);
  }

  private async publishEvent(routingKey: string, payload: any): Promise<void> {
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
