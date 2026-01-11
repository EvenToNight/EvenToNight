import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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
