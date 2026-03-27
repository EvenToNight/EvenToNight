import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { OrderRepositoryImpl } from 'src/tickets/infrastructure/persistence/repositories/order.repository';
import {
  OrderDocument,
  OrderSchema,
} from 'src/tickets/infrastructure/persistence/schemas/order.schema';
import { Order } from 'src/tickets/domain/aggregates/order.aggregate';
import { OrderId } from 'src/tickets/domain/value-objects/order-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { TicketId } from 'src/tickets/domain/value-objects/ticket-id.vo';
import { OrderStatus } from 'src/tickets/domain/value-objects/order-status.vo';

describe('OrderRepositoryImpl (integration)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let repo: OrderRepositoryImpl;
  let orderModel: Model<OrderDocument>;

  let orderCounter = 0;
  const makeOrder = (
    overrides: { userId?: string; eventId?: string } = {},
  ): Order =>
    Order.create({
      id: OrderId.fromString(`order-${++orderCounter}`),
      userId: UserId.fromString(overrides.userId ?? 'user-1'),
      eventId: EventId.fromString(overrides.eventId ?? 'ev-1'),
      ticketIds: [TicketId.fromString('ticket-1')],
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    });

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongod.getUri()),
        MongooseModule.forFeature([
          { name: OrderDocument.name, schema: OrderSchema },
        ]),
      ],
      providers: [OrderRepositoryImpl],
    }).compile();

    repo = module.get(OrderRepositoryImpl);
    orderModel = module.get<Model<OrderDocument>>(
      getModelToken(OrderDocument.name),
    );
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
    orderCounter = 0;
  });

  describe('save + findById', () => {
    it('saves an order and retrieves it by ID', async () => {
      const order = makeOrder({ userId: 'user-save' });
      await repo.save(order);

      const found = await repo.findById(order.getId().toString());
      expect(found).not.toBeNull();
      expect(found!.getId().toString()).toBe(order.getId().toString());
      expect(found!.getUserId().toString()).toBe('user-save');
      expect(found!.getStatus().toString()).toBe('PENDING');
    });

    it('returns null for a non-existent ID', async () => {
      expect(await repo.findById('non-existent')).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns all orders for a user, excluding other users', async () => {
      await repo.save(makeOrder({ userId: 'user-a' }));
      await repo.save(makeOrder({ userId: 'user-a' }));
      await repo.save(makeOrder({ userId: 'user-b' }));

      const result = await repo.findByUserId('user-a');
      expect(result).toHaveLength(2);
      expect(result.every((o) => o.getUserId().toString() === 'user-a')).toBe(
        true,
      );
    });

    it('returns empty array when user has no orders', async () => {
      const result = await repo.findByUserId('nobody');
      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('updates and returns the modified order', async () => {
      const order = makeOrder();
      await repo.save(order);
      order.complete();

      const updated = await repo.update(order);
      expect(updated.getStatus().toString()).toBe('COMPLETED');

      const fromDb = await repo.findById(order.getId().toString());
      expect(fromDb!.getStatus().toString()).toBe('COMPLETED');
    });

    it('throws when updating a non-existent order', async () => {
      const ghost = makeOrder();
      await expect(repo.update(ghost)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('deletes an order; findById returns null afterwards', async () => {
      const order = makeOrder();
      await repo.save(order);

      await repo.delete(order.getId().toString());

      expect(await repo.findById(order.getId().toString())).toBeNull();
    });
  });

  describe('deleteAll', () => {
    it('removes all orders from the collection', async () => {
      const o1 = makeOrder();
      const o2 = makeOrder();
      await repo.save(o1);
      await repo.save(o2);

      await repo.deleteAll();

      expect(await repo.findById(o1.getId().toString())).toBeNull();
      expect(await repo.findById(o2.getId().toString())).toBeNull();
    });
  });
});
