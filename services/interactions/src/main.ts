import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableShutdownHooks();

  const port = process.env.INTERACTIONS_SERVICE_PORT ?? 9030;
  await app.listen(port);
  console.log(`Service running on port ${port}`);
}
bootstrap();
