import { Injectable } from '@nestjs/common';
import { Ticket } from '../../domain/aggregates/ticket.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../dto/create-checkout-session.dto';
import { EventTicketTypeNotFoundException } from '../../domain/exceptions/event-ticket-type-not-found.exception';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { ClientSession } from 'mongoose';
import { StripeService } from 'src/payments/infrastructure/stripe/stripe.service';
import { CheckoutSessionLineItem } from 'src/payments/infrastructure/stripe/stripe.service';
import { EventTicketTypeService } from '../services/event-ticket-type.service';
import { TicketService } from '../services/ticket.service';
import { OrderService } from '../services/order.service';

type LineItem = {
  ticketType: EventTicketType;
  count: number;
  tickets: Ticket[];
};

type LineItemsMap = Map<string, LineItem>;

@Injectable()
export class CreateCheckoutSessionHandler {
  private readonly isDev = process.env.NODE_ENV === 'development';
  constructor(
    private readonly transactionManager: TransactionManager,
    private readonly stripeService: StripeService,
    private readonly ticketTypeService: EventTicketTypeService,
    private readonly ticketService: TicketService,
    private readonly orderService: OrderService,
  ) {}

  private async getTicketTypeWithLock(
    ticketTypeId: string,
    session: ClientSession,
  ): Promise<EventTicketType> {
    const ticketType = await this.ticketTypeService.findTicketTypeByIdWithLock(
      ticketTypeId,
      session,
    );

    if (!ticketType) {
      throw new EventTicketTypeNotFoundException(ticketTypeId);
    }
    return ticketType;
  }

  private async reserveTickets(
    dto: CreateCheckoutSessionDto,
  ): Promise<LineItemsMap> {
    return this.transactionManager.executeInTransaction<LineItemsMap>(
      async (session) => {
        const tickets: Ticket[] = [];
        const ticketTypeMap = new Map<string, EventTicketType>(); // cache for ticket types

        for (const item of dto.items) {
          if (!ticketTypeMap.get(item.ticketTypeId)) {
            ticketTypeMap.set(
              item.ticketTypeId,
              await this.getTicketTypeWithLock(item.ticketTypeId, session),
            );
          }
          ticketTypeMap.get(item.ticketTypeId)!.reserveTicket();
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
      },
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
      } as CheckoutSessionLineItem;
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

    const order = await this.orderService.createOrder(
      UserId.fromString(dto.userId),
      ticketIds,
    );

    if (this.isDev) {
      const tempWebHook = `http://localhost:${process.env.PORT || 9050}/dev/checkout-webhook/completed`;
      return {
        sessionId: 'cs_test_dev_session',
        redirectUrl: tempWebHook,
        expiresAt: Date.now() + 3600,
        orderId: order.getId(),
      };
    }

    const session = await this.stripeService.createCheckoutSessionWithItems({
      userId: dto.userId,
      lineItems,
      metadata: {
        ticketIds: JSON.stringify(ticketIds),
        ticketTypeIds: JSON.stringify(ticketTypeIds),
        eventId,
      },
      successUrl: dto.successUrl || 'https://google.com',
      cancelUrl: `http://localhost:9050/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&redirect_to=${encodeURIComponent(dto.cancelUrl || 'https://google.com')}`,
    });

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return {
      sessionId: session.id,
      redirectUrl: session.url!,
      expiresAt: session.expires_at,
      orderId: order.getId(),
    };
  }
}
