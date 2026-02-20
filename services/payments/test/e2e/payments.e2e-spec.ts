import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher, OutboxRelayService } from '@libs/nestjs-common';
import { UserEventConsumer } from 'src/tickets/presentation/consumers/user-event.consumer';
import { AppModule } from 'src/app.module';

describe('Payments API (e2e)', () => {
  let app: INestApplication;
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

  it('/health (GET)', async () => {
    const res = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get('/health')
      .expect(200);
    expect((res.body as { status: string }).status).toBe('ok');
  });
});
