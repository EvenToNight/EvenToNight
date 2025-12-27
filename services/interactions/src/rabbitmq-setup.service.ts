import * as amqp from 'amqplib';

export class RabbitMqSetupService {
  async setup(rabbitmqUrl: string) {
    const connection = await amqp.connect(rabbitmqUrl);

    const channel = await connection.createChannel();

    const exchange = 'events';
    const queue = 'interactions_queue';
    const routingKeys = ['event.published'];

    await channel.assertExchange(exchange, 'topic', {
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
  }
}
