import * as amqp from 'amqplib';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
export class RabbitMqSetupService {
  async setup(rabbitmqUrl: string) {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    const exchange = 'eventonight';
    const queue = 'interactions_queue';
    const routingKeys = [
      'event.created',
      'event.published',
      'user.created',
      'event.cancelled',
      'event.deleted',
      'user.deleted',
      'payments.order.confirmed',
      'event.completed',
      'user.updated',
      'event.updated',
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
