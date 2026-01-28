import * as amqp from 'amqplib';

export class RabbitMqSetupService {
  async setup(rabbitmqUrl: string) {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    const exchange = 'eventonight';
    const queue = 'payments_queue';
    const routingKeys = [
      'user.created',
      'user.updated',
      'user.deleted',
      'event.created', // TODO: remove and get title from REST endpoint
      'event.updated',
      'event.published',
      'event.completed',
      'event.cancelled',
      'event.deleted',
    ];

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
