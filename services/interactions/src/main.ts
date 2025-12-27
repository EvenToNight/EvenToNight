import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RabbitMqSetupService } from './rabbitmq-setup.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableShutdownHooks();

  const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
  const rabbitmqUser = process.env.RABBITMQ_USER || 'admin';
  const rabbitmqPass = process.env.RABBITMQ_PASS || 'admin';
  const rabbitmqUrl = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:5672`;

  const setupService = new RabbitMqSetupService();
  await setupService.setup(rabbitmqUrl);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'interactions_queue',
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.INTERACTIONS_SERVICE_PORT ?? 9030;
  await app.listen(port);
  console.log(`Service running on port ${port}`);
}
bootstrap();
