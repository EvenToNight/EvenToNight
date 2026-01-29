import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage } from "amqplib";
import { config } from "../../../config/env.config";
import { CreateNotificationFromEventHandler } from "notifications/application/handlers/create-notification-from-event.handler";
import { ExternalEventMapper } from "notifications/application/mapper/external-event.mapper";

export interface EventEnvelope<T> {
  eventType: string;
  occurredAt: Date;
  payload: T;
}

export class RabbitMQConsumer {
  private connection: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;

  constructor(
    private readonly createNotificationHandler: CreateNotificationFromEventHandler,
  ) {}

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
      console.log("✅ RabbitMQ Consumer channel established");
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  private async startConsuming(channel: ConfirmChannel): Promise<void> {
    const queue = config.rabbitmq.queue;

    console.log(`📥 Binding to queue: ${queue}`);

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
    channel: ConfirmChannel,
    msg: ConsumeMessage,
    routingKey: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`🔄 Processing message with ${routingKey}...`);

      const rawContent = msg.content.toString();
      const eventEnvelope: EventEnvelope<any> = JSON.parse(rawContent);

      console.log(
        `📦 Event payload:`,
        JSON.stringify(eventEnvelope.payload, null, 2),
      );

      const command = ExternalEventMapper.mapToCommand(
        routingKey,
        eventEnvelope.payload,
      );

      if (!command) {
        console.warn(
          `⚠️  No handler for routing key: ${routingKey}. Skipping message.`,
        );
        channel.ack(msg);
        return;
      }

      const notificationId =
        await this.createNotificationHandler.execute(command);

      const duration = Date.now() - startTime;
      console.log(
        `✅ Notification created successfully: ${notificationId} (${duration}ms)`,
      );
      channel.ack(msg);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Error processing message: ${error} (${duration}ms)`);
      channel.nack(msg, false, false);
    }
  }
}
