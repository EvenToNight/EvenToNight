import * as amqp from 'amqplib';

export interface RabbitMQConfiguration {
  url: string;
  queue: string;
  routingKeys: string[];
  exchange?: string;
}

export class RabbitMqService {
  static async setup(configuration: RabbitMQConfiguration) {
    const connection = await amqp.connect(configuration.url);
    const channel = await connection.createChannel();

    const exchange = configuration.exchange ?? 'eventonight';

    await channel.assertExchange(exchange, 'topic', {
      durable: true,
    });

    await channel.assertQueue(configuration.queue, {
      durable: true,
    });

    for (const key of configuration.routingKeys) {
      await channel.bindQueue(configuration.queue, exchange, key);
    }

    await channel.close();
    await connection.close();

    console.log(
      `✅ RabbitMQ setup: queue "${configuration.queue}" bound to exchange "${exchange}"`,
    );
  }
}
