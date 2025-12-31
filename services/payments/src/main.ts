import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhook signature verification
  });

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableShutdownHooks();

  const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
  const rabbitmqUser = process.env.RABBITMQ_USER || 'admin';
  const rabbitmqPass = process.env.RABBITMQ_PASS || 'admin';
  const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:5672`;

  console.log(`🔗 Connecting to RabbitMQ at ${rabbitmqHost}`);

  // Connect as microservice consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'payments_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('✅ RabbitMQ microservice started');

  const port = process.env.PAYMENTS_SERVICE_PORT ?? 9040;
  await app.listen(port);
  console.log(`🚀 Payments service running on port ${port}`);
}

bootstrap();
