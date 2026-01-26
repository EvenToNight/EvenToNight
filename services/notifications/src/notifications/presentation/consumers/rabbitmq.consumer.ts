import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage } from "amqplib";
import { config } from "../../../config/env.config";

export interface EventEnvelope<T> {
  eventType: string;
  occurredAt: Date;
  payload: T;
}

export interface NotificationGateway {
  sendNotificationToUser(userId: string, notification: any): Promise<void>;
}

export class RabbitMQConsumer {
  private connection: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;

  constructor(private readonly notificationGateway: NotificationGateway) {}

  async connect(): Promise<void> {
    try {
      this.connection = amqp.connect([config.rabbitmq.url]);

      this.connection.on("connect", () => {
        console.log("✅ RabbitMQ Consumer connected");
      });

      this.connection.on("disconnect", (err) => {
        console.log("⚠️  RabbitMQ connection closed. Reconnecting...", err);
      });

      this.connection.on("connectFailed", (err) => {
        console.error("❌ RabbitMQ connection failed:", err);
      });

      this.channelWrapper = this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          await channel.prefetch(1);
          await this.startConsuming(channel);
        },
      });

      await this.channelWrapper.waitForConnect();
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  private async startConsuming(channel: ConfirmChannel): Promise<void> {
    const queue = config.rabbitmq.queue;

    await channel.consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (!msg) return;
        const routingKey = msg.fields.routingKey;
        console.log(`📥 Received message: ${routingKey}`);
        void this.processMessage(channel, msg, routingKey);
      },
      { noAck: false },
    );

    console.log(`Listening for messages on queue: ${queue}`);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  private async processMessage(
    _channel: ConfirmChannel,
    _msg: ConsumeMessage,
    _routingKey: string,
  ): Promise<void> {
    console.log(`🔄 Processing message with ${_routingKey}...`);
    console.log(JSON.parse(_msg.content.toString()));
  }
}
