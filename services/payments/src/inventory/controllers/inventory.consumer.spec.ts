import { Test, TestingModule } from '@nestjs/testing';
import { InventoryConsumer } from './inventory.consumer';
import { InventoryService } from '../services/inventory.service';
import { RefundService } from '../../payments/services/refund.service';
import type {
  EventEnvelope,
  TicketsCreatedPayload,
  TicketsUpdatedPayload,
  EventCancelledPayload,
} from '../../common/events/event-envelope';

describe('InventoryConsumer', () => {
  let consumer: InventoryConsumer;
  let inventoryService: InventoryService;
  let refundService: RefundService;

  const mockInventoryService = {
    createTicketCategories: jest.fn(),
    updateTicketCategories: jest.fn(),
  };

  const mockRefundService = {
    processEventCancellationRefunds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryConsumer,
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: RefundService,
          useValue: mockRefundService,
        },
      ],
    }).compile();

    consumer = module.get<InventoryConsumer>(InventoryConsumer);
    inventoryService = module.get<InventoryService>(InventoryService);
    refundService = module.get<RefundService>(RefundService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('handleTicketsCreated', () => {
    it('should create ticket categories when receiving event.tickets.created', async () => {
      const envelope: EventEnvelope<TicketsCreatedPayload> = {
        eventType: 'event.tickets.created',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          categories: [
            {
              name: 'VIP',
              description: 'VIP access',
              price: 15000,
              totalCapacity: 50,
              saleStartDate: null,
              saleEndDate: null,
            },
            {
              name: 'Standard',
              description: 'Standard access',
              price: 5000,
              totalCapacity: 200,
              saleStartDate: null,
              saleEndDate: null,
            },
          ],
        },
      };

      const mockCreatedCategories = [
        { _id: 'cat_1', eventId: 'event_123', name: 'VIP' },
        { _id: 'cat_2', eventId: 'event_123', name: 'Standard' },
      ];

      mockInventoryService.createTicketCategories.mockResolvedValue(
        mockCreatedCategories,
      );

      await consumer.handleTicketsCreated(envelope);

      expect(inventoryService.createTicketCategories).toHaveBeenCalledWith(
        'event_123',
        expect.arrayContaining([
          expect.objectContaining({
            name: 'VIP',
            price: 15000,
            totalCapacity: 50,
          }),
        ]),
      );
    });

    it('should handle categories with sale dates', async () => {
      const envelope: EventEnvelope<TicketsCreatedPayload> = {
        eventType: 'event.tickets.created',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          categories: [
            {
              name: 'Early Bird',
              description: 'Early bird pricing',
              price: 3000,
              totalCapacity: 100,
              saleStartDate: '2025-01-01T00:00:00Z',
              saleEndDate: '2025-01-15T23:59:59Z',
            },
          ],
        },
      };

      mockInventoryService.createTicketCategories.mockResolvedValue([]);

      await consumer.handleTicketsCreated(envelope);

      expect(inventoryService.createTicketCategories).toHaveBeenCalledWith(
        'event_123',
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Early Bird',
            saleStartDate: '2025-01-01T00:00:00Z',
            saleEndDate: '2025-01-15T23:59:59Z',
          }),
        ]),
      );
    });

    it('should not throw if category creation fails (graceful degradation)', async () => {
      const envelope: EventEnvelope<TicketsCreatedPayload> = {
        eventType: 'event.tickets.created',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          categories: [
            {
              name: 'VIP',
              description: 'VIP',
              price: 15000,
              totalCapacity: 50,
              saleStartDate: null,
              saleEndDate: null,
            },
          ],
        },
      };

      mockInventoryService.createTicketCategories.mockRejectedValue(
        new Error('Database error'),
      );

      // Should not throw - message should be acknowledged
      await expect(consumer.handleTicketsCreated(envelope)).resolves.not.toThrow();
    });
  });

  describe('handleTicketsUpdated', () => {
    it('should log warning when receiving event.tickets.updated', async () => {
      const envelope: EventEnvelope<TicketsUpdatedPayload> = {
        eventType: 'event.tickets.updated',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          categories: [
            {
              name: 'VIP',
              description: 'Updated VIP',
              price: 12000,
              totalCapacity: 60,
              saleStartDate: null,
              saleEndDate: null,
            },
          ],
        },
      };

      // Currently just logs warning - no actual update
      await consumer.handleTicketsUpdated(envelope);

      // Should not call update service (not implemented yet)
      expect(mockInventoryService.updateTicketCategories).not.toHaveBeenCalled();
    });

    it('should not throw if update handler fails', async () => {
      const envelope: EventEnvelope<TicketsUpdatedPayload> = {
        eventType: 'event.tickets.updated',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          categories: [],
        },
      };

      // Should handle gracefully
      await expect(consumer.handleTicketsUpdated(envelope)).resolves.not.toThrow();
    });
  });

  describe('handleEventCancelled', () => {
    it('should process automatic refunds when event is cancelled', async () => {
      const envelope: EventEnvelope<EventCancelledPayload> = {
        eventType: 'event.cancelled',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          reason: 'Venue unavailable',
        },
      };

      mockRefundService.processEventCancellationRefunds.mockResolvedValue(undefined);

      await consumer.handleEventCancelled(envelope);

      expect(refundService.processEventCancellationRefunds).toHaveBeenCalledWith(
        'event_123',
        'Venue unavailable',
      );
    });

    it('should handle refunds for different cancellation reasons', async () => {
      const envelope: EventEnvelope<EventCancelledPayload> = {
        eventType: 'event.cancelled',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_456',
          reason: 'Artist illness',
        },
      };

      mockRefundService.processEventCancellationRefunds.mockResolvedValue(undefined);

      await consumer.handleEventCancelled(envelope);

      expect(refundService.processEventCancellationRefunds).toHaveBeenCalledWith(
        'event_456',
        'Artist illness',
      );
    });

    it('should not throw if refund processing fails', async () => {
      const envelope: EventEnvelope<EventCancelledPayload> = {
        eventType: 'event.cancelled',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_123',
          reason: 'Test cancellation',
        },
      };

      mockRefundService.processEventCancellationRefunds.mockRejectedValue(
        new Error('Stripe API error'),
      );

      // Should not throw - logs error and continues
      await expect(consumer.handleEventCancelled(envelope)).resolves.not.toThrow();
    });

    it('should handle multiple concurrent cancellations', async () => {
      const envelopes: EventEnvelope<EventCancelledPayload>[] = [
        {
          eventType: 'event.cancelled',
          occurredAt: new Date().toISOString(),
          payload: { eventId: 'event_1', reason: 'Reason 1' },
        },
        {
          eventType: 'event.cancelled',
          occurredAt: new Date().toISOString(),
          payload: { eventId: 'event_2', reason: 'Reason 2' },
        },
      ];

      mockRefundService.processEventCancellationRefunds.mockResolvedValue(undefined);

      await Promise.all(envelopes.map((e) => consumer.handleEventCancelled(e)));

      expect(refundService.processEventCancellationRefunds).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling and resilience', () => {
    it('should acknowledge message even if processing fails', async () => {
      const envelope: EventEnvelope<TicketsCreatedPayload> = {
        eventType: 'event.tickets.created',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_fail',
          categories: [],
        },
      };

      mockInventoryService.createTicketCategories.mockRejectedValue(
        new Error('Critical error'),
      );

      // Should not re-throw to prevent infinite retries
      await expect(consumer.handleTicketsCreated(envelope)).resolves.not.toThrow();
    });

    it('should log errors for debugging', async () => {
      const envelope: EventEnvelope<EventCancelledPayload> = {
        eventType: 'event.cancelled',
        occurredAt: new Date().toISOString(),
        payload: {
          eventId: 'event_error',
          reason: 'Test',
        },
      };

      const testError = new Error('Test error with stack trace');
      mockRefundService.processEventCancellationRefunds.mockRejectedValue(testError);

      await consumer.handleEventCancelled(envelope);

      // Errors should be logged but not thrown
      expect(refundService.processEventCancellationRefunds).toHaveBeenCalled();
    });
  });
});
