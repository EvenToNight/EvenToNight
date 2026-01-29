import * as amqp from "amqplib";
import { config } from "./env.config";

export class RabbitMQ {
  static async setup(): Promise<void> {
    try {
      const connection = await amqp.connect(config.rabbitmq.url);
      const channel = await connection.createChannel();

      const exchange = config.rabbitmq.exchange;
      const queue = config.rabbitmq.queue;

      const routingKeys = [
        "user.created",
        "event.created",
        //TODO: Add routing keys
      ];

      await channel.assertExchange(exchange, "topic", {
        durable: true,
      });

      await channel.assertQueue(queue, {
        durable: true,
      });

      for (const key of routingKeys) {
        await channel.bindQueue(queue, exchange, key);
      }

      await channel.close();
      await connection.close();

      console.log(
        `✅ RabbitMQ setup: queue "${queue}" bound to exchange "${exchange}"`,
      );
      console.log(`📋 Routing keys: ${routingKeys.join(", ")}`);
    } catch (error) {
      console.error("❌ RabbitMQ setup failed:", error);
      throw error;
    }
  }
}
