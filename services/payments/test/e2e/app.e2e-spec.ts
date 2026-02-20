import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserEventConsumer } from 'src/tickets/presentation/consumers/user-event.consumer';
import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    process.env.MONGO_URI = mongoUri;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYMENT_SERVICE)
      .useValue({
        createCheckoutSession: jest.fn(),
        handleWebhookEvent: jest.fn(),
      })
      .overrideProvider(EventPublisher)
      .useValue({
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
        publish: jest.fn(),
      })
      .overrideProvider(OutboxRelayService)
      .useValue({})
      .overrideProvider(UserEventConsumer)
      .useValue({
        handleAllEvents: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
