import { Injectable, Inject } from '@nestjs/common';
import { Ticket } from '../../domain/aggregates/ticket.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';
import type { TicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { TICKET_REPOSITORY } from '../../domain/repositories/ticket.repository.interface';
import type { EventTicketTypeRepository } from '../../domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from '../../domain/repositories/event-ticket-type.repository.interface';
import { TransactionManager } from '../../infrastructure/database/transaction.manager';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
} from '../dto/create-checkout-session.dto';
import { EventTicketTypeNotFoundException } from '../../domain/exceptions/event-ticket-type-not-found.exception';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { ClientSession } from 'mongoose';

type LineItem = {
  ticketType: EventTicketType;
  count: number;
  tickets: Ticket[];
};

type LineItemsMap = Map<string, LineItem>;

@Injectable()
export class CreateCheckoutSessionHandler {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly ticketTypeRepository: EventTicketTypeRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  private async getTicketTypeWithLock(
    ticketTypeId: string,
    session: ClientSession,
  ): Promise<EventTicketType> {
    const ticketType = await this.ticketTypeRepository.findByIdWithLock(
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
          await this.ticketTypeRepository.update(ticketType);
        }

        const savedTickets: Ticket[] = [];
        for (const ticket of tickets) {
          const saved = await this.ticketRepository.save(ticket);
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

    const tempWebHook = `http://localhost:${process.env.PORT || 9050}/dev/checkout-webhook/completed`;

    const ticketIds = Array.from(reservedTickets.values()).flatMap((lineItem) =>
      lineItem.tickets.map((t) => t.getId()),
    );

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return {
      sessionId: 'checkoutSession.id',
      redirectUrl: tempWebHook,
      expiresAt: Math.floor(expiresAt.getTime() / 1000),
      reservedTicketIds: ticketIds,
    };
  }
}
