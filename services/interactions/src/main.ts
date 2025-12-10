import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.enableShutdownHooks();

  const port = process.env.INTERACTIONS_SERVICE_PORT ?? 9030;
  await app.listen(port);
  console.log(`Service running on port ${port}`);
}
bootstrap();
