import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';
import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';
import { EventPublisher } from 'src/commons/intrastructure/messaging/event-publisher';
import { UserEventConsumer } from 'src/tickets/presentation/consumers/user-event.consumer';
import { EventTicketTypeResponseDto } from 'src/tickets/application/dto/event-ticket-type-response.dto';

describe('Payments API (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(MongooseModule)
      .useModule(
        MongooseModule.forRoot(mongoUri, {
          dbName: 'test',
        }),
      )
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

  it('POST /events/:eventId/ticket-types', async () => {
    const res = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/events/123/ticket-types')
      .send({ type: 'VIP', price: 100, quantity: 50, creatorId: 'user-1' })
      .expect(201);
    expect((res.body as EventTicketTypeResponseDto).id).toBeDefined();
  });
});
