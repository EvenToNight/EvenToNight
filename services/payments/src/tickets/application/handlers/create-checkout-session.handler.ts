import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Ticket } from '../../domain/aggregates/ticket.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../dto/create-checkout-session.dto';
import { EventTicketTypeNotFoundException } from '../../domain/exceptions/event-ticket-type-not-found.exception';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import {
  type PaymentService,
  PAYMENT_SERVICE,
} from '../../domain/services/payment.service.interface';
import { CheckoutLineItem } from '../../domain/types/payment-service.types';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { OrderService } from '../services/order.service';
import { PAYMENT_SERVICE_BASE_URL } from '../constants';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { EventService } from '../services/event.service';
import { CheckoutSessionExpiredHandler } from './checkout-session-expired.handler';
import { UserService } from '../services/user.service';
import { CheckoutSessionCompletedHandler } from './checkout-session-completed.handler';
import { TRANSACTION_MANAGER, type TransactionManager } from '@libs/ts-common';
import { Transactional } from '@libs/ts-common';

type LineItem = {
  ticketType: EventTicketType;
  count: number;
  tickets: Ticket[];
};

type LineItemsMap = Map<string, LineItem>;

@Injectable()
export class CreateCheckoutSessionHandler {
  private readonly isDev = process.env.NODE_ENV === 'development';
  private readonly isTest = process.env.TEST_DEPLOYMENT === 'true';
  private readonly logger = new Logger(CreateCheckoutSessionHandler.name);
  constructor(
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: PaymentService,
    private readonly ticketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly orderService: OrderService,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly checkoutSessionExpiredHandler: CheckoutSessionExpiredHandler,
    //for testing purposes
    private readonly checkoutCompletedHandler: CheckoutSessionCompletedHandler,
  ) {}

  private async getTicketTypeWithLock(
    ticketTypeId: string,
  ): Promise<EventTicketType> {
    const ticketType = await this.ticketTypeService.findById(ticketTypeId);

    if (!ticketType) {
      throw new EventTicketTypeNotFoundException(ticketTypeId);
    }
    return ticketType;
  }

  @Transactional()
  private async reserveTickets(
    dto: CreateCheckoutSessionDto,
  ): Promise<LineItemsMap> {
    const tickets: Ticket[] = [];
    const ticketTypeMap = new Map<string, EventTicketType>(); // cache for ticket types

    for (const item of dto.items) {
      if (!ticketTypeMap.get(item.ticketTypeId)) {
        ticketTypeMap.set(
          item.ticketTypeId,
          await this.getTicketTypeWithLock(item.ticketTypeId),
        );
      }
      ticketTypeMap.get(item.ticketTypeId)!.reserveTicket();
    }

    for (const item of ticketTypeMap.values()) {
      const res = await this.eventService.findById(
        item.getEventId().toString(),
      );
      if (!res) {
        throw new NotFoundException(
          `Event with id ${item.getEventId().toString()} not found`,
        );
      }
      if (res.getStatus().toString() !== 'PUBLISHED') {
        throw new BadRequestException(
          `Cannot reserve tickets for event with id ${item
            .getEventId()
            .toString()} because it is not published`,
        );
      }
    }

    for (const item of dto.items) {
      const ticketType = ticketTypeMap.get(item.ticketTypeId)!;
      const ticket = Ticket.createPending({
        eventId: ticketType.getEventId(),
        userId: UserId.fromString(dto.userId),
        attendeeName: item.attendeeName,
        ticketTypeId: ticketType.getId(),
        price: ticketType.getPrice(),
        purchaseDate: new Date(),
      });
      tickets.push(ticket);
    }

    for (const ticketType of ticketTypeMap.values()) {
      await this.ticketTypeService.update(ticketType);
    }

    const savedTickets: Ticket[] = [];
    for (const ticket of tickets) {
      const saved = await this.ticketService.save(ticket);
      savedTickets.push(saved);
    }

    return this.groupTicketsByType(
      savedTickets,
      Array.from(ticketTypeMap.values()),
    );
  }

  private groupTicketsByType(
    tickets: Ticket[],
    ticketTypes: EventTicketType[],
  ): LineItemsMap {
    const lineItemsMap: LineItemsMap = new Map();
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const key = ticket.getTicketTypeId();
      const ticketType = ticketTypes.find((tt) => tt.getId() === key);
      if (!ticketType) {
        throw new EventTicketTypeNotFoundException(key);
      }
      if (!lineItemsMap.has(key)) {
        lineItemsMap.set(key, {
          ticketType: ticketType,
          count: 0,
          tickets: [],
        });
      }
      const entry = lineItemsMap.get(key)!;
      entry.count++;
      entry.tickets.push(ticket);
    }
    return lineItemsMap;
  }

  async handle(
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    // ========================================
    // PHASE 1: Reserve inventory for all tickets (TX1)
    // ========================================
    const reservedTickets = await this.reserveTickets(dto);

    const lineItems = Array.from(reservedTickets.values()).map((lineItem) => {
      const ticketType = lineItem.ticketType;
      return {
        productName: ticketType.getType().toString(),
        productDescription: ticketType.getDescription(),
        price: ticketType.getPrice(),
        quantity: lineItem.count,
      } as CheckoutLineItem;
    });

    const ticketIds = Array.from(reservedTickets.values()).flatMap((lineItem) =>
      lineItem.tickets.map((t) => t.getId()),
    );
    const ticketTypeIds = Array.from(reservedTickets.values()).flatMap(
      (lineItem) => new Set(lineItem.tickets.map((t) => t.getTicketTypeId())),
    );

    const eventId = Array.from(reservedTickets.values())[0]
      .ticketType.getEventId()
      .toString();

    const event = await this.eventService.findById(eventId);
    const userLanguage = await this.userService.getUserLanguage(dto.userId);
    const order = await this.orderService.createOrder(
      UserId.fromString(dto.userId),
      EventId.fromString(eventId),
      ticketIds,
    );

    this.logger.log('CREATING CHECKOUT SESSION');
    if (this.isDev || this.isTest) {
      this.logger.log('DEV/TEST ENVIRONMENT - MOCK CHECKOUT SESSION');
      //TODO evaluate to uniform the redirectUrl, normally a GET has to be performed not a POST
      // const tempWebHook = `http://localhost:${process.env.PORT || 9050}/dev/webhooks/stripe/`;
      await this.checkoutCompletedHandler.handle(
        'cs_test_dev_session',
        order.getId(),
      );
      this.logger.log('Mock checkout session created');
      return {
        sessionId: 'cs_test_dev_session',
        redirectUrl: dto.successUrl,
        expiresAt: Date.now() + 3600,
        orderId: order.getId(),
      };
    }

    try {
      const session = await this.paymentService.createCheckoutSessionWithItems({
        userId: dto.userId,
        orderId: order.getId(),
        lineItems,
        ticketIds: ticketIds,
        ticketTypeIds: ticketTypeIds,
        eventId,
        eventTitle: event?.getTitle(),
        language: userLanguage,
        successUrl: dto.successUrl,
        cancelUrl: `${PAYMENT_SERVICE_BASE_URL}/checkout-sessions/{CHECKOUT_SESSION_ID}/cancel?redirect_to=${encodeURIComponent(dto.cancelUrl)}`,
      });

      return {
        sessionId: session.id,
        redirectUrl: session.redirectUrl!,
        expiresAt: session.expiresAt,
        orderId: order.getId(),
      };
    } catch (error) {
      await this.checkoutSessionExpiredHandler.handle(
        'NO_SESSION_CREATED',
        order.getId(),
        'Failed to create checkout session',
      );
      throw error;
    }
  }
}
