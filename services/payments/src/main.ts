import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { RabbitMqService } from './libs/ts-common/src/messaging/rabbitmq/rabbitmq.service';

const envFromRoot: Record<string, string> = {};
dotenv.config({
  path: join(__dirname, '..', '..', '..', '.env'),
  processEnv: envFromRoot,
});
if (!process.env.STRIPE_SECRET_KEY && envFromRoot['STRIPE_SECRET_KEY']) {
  process.env.STRIPE_SECRET_KEY = envFromRoot['STRIPE_SECRET_KEY'];
}
if (
  !process.env.STRIPE_WEBHOOK_SECRET &&
  envFromRoot['STRIPE_WEBHOOK_SECRET']
) {
  process.env.STRIPE_WEBHOOK_SECRET = envFromRoot['STRIPE_WEBHOOK_SECRET'];
}

if (
  !process.env.PAYMENTS_SERVICE_PORT &&
  envFromRoot['PAYMENTS_SERVICE_PORT']
) {
  process.env.PAYMENTS_SERVICE_PORT = envFromRoot['PAYMENTS_SERVICE_PORT'];
}

if (
  process.env.ENV === 'development' &&
  !process.env.RABBITMQ_USER &&
  envFromRoot['RABBITMQ_USER']
) {
  process.env.RABBITMQ_USER = envFromRoot['RABBITMQ_USER'];
}

if (
  process.env.ENV === 'development' &&
  !process.env.RABBITMQ_PASS &&
  envFromRoot['RABBITMQ_PASS']
) {
  process.env.RABBITMQ_PASS = envFromRoot['RABBITMQ_PASS'];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
  const rabbitmqUser = process.env.RABBITMQ_USER || 'guest';
  const rabbitmqPass = process.env.RABBITMQ_PASS || 'guest';
  const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:5672`;

  const service_queue = 'payments_queue';

  await RabbitMqService.setup({
    url: rabbitmqUrl,
    queue: service_queue,
    routingKeys: [
      'user.created',
      'user.updated',
      'user.deleted',
      'event.updated',
      'event.published',
      'event.completed',
      'event.cancelled',
      'event.deleted',
    ],
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: service_queue,
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PAYMENTS_SERVICE_PORT ?? 9050;
  await app.listen(port);
  console.log(`Payments service running on port ${port}`);
}
bootstrap()
  .then(() => {
    console.log('Payments service is running...');
  })
  .catch((err) => {
    console.error('Error starting Payments service:', err);
  });
