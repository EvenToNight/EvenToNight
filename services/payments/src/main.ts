import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RabbitMqSetupService } from './rabbitmq-setup.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const setupService = new RabbitMqSetupService();
  await setupService.setup(rabbitmqUrl);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'payments_queue',
      noAck: false,
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
