import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { EventTicketTypeRepository } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EventTicketType } from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import type { ClientSession } from 'mongoose';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { UpdateEventTicketTypeDto } from '../dto/update-event-ticket-type.dto';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TransactionManager } from 'src/tickets/infrastructure/database/transaction.manager';

@Injectable()
export class EventTicketTypeService {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly eventTicketTypeRepository: EventTicketTypeRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  findTicketTypeByIdWithLock(
    ticketTypeId: string,
    session: ClientSession,
  ): Promise<EventTicketType | null> {
    return this.eventTicketTypeRepository.findByIdWithLock(
      ticketTypeId,
      session,
    );
  }

  update(ticketType: EventTicketType): Promise<EventTicketType> {
    return this.transactionManager.executeInTransaction(async (session) => {
      return this.eventTicketTypeRepository.update(ticketType, session);
    });
  }

  async updateTicket(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    return this.transactionManager.executeInTransaction(async (session) => {
      const ticketType = await this.findTicketTypeByIdWithLock(id, session);
      if (!ticketType) {
        throw new Error(`EventTicketType with id ${id} not found`);
      }
      if (dto.description) ticketType.setDescription(dto.description);
      if (dto.price)
        ticketType.setPrice(
          Money.fromAmount(dto.price.amount, dto.price.currency),
        );
      if (dto.quantity) ticketType.setTotalQuantity(dto.quantity);
      return this.eventTicketTypeRepository.update(ticketType, session);
    });
  }

  async updateTicketAndMakeSoldOut(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    return this.transactionManager.executeInTransaction(async (session) => {
      const ticketType = await this.findTicketTypeByIdWithLock(id, session);
      if (!ticketType) {
        throw new Error(`EventTicketType with id ${id} not found`);
      }
      dto.quantity = ticketType.getSoldQuantity();
      if (dto.description) ticketType.setDescription(dto.description);
      if (dto.price)
        ticketType.setPrice(
          Money.fromAmount(dto.price.amount, dto.price.currency),
        );
      if (dto.quantity) ticketType.setTotalQuantity(dto.quantity);
      return this.eventTicketTypeRepository.update(ticketType, session);
    });
  }

  findById(id: string): Promise<EventTicketType | null> {
    return this.eventTicketTypeRepository.findById(id);
  }

  findByEventId(eventId: string): Promise<EventTicketType[]> {
    return this.eventTicketTypeRepository.findByEventId(eventId);
  }

  delete(id: string): Promise<void> {
    return this.transactionManager.executeInTransaction(async (session) => {
      await this.eventTicketTypeRepository.delete(id, session);
    });
  }

  async deleteEventTicketTypes(eventId: string): Promise<string[]> {
    return this.transactionManager.executeInTransaction(async (session) => {
      const eventTicketTypesIds = (
        await this.eventTicketTypeRepository.findByEventIdWithLock(
          eventId,
          session,
        )
      ).map((t) => t.getId());
      await Promise.all(
        eventTicketTypesIds.map((ttId) =>
          this.eventTicketTypeRepository.delete(ttId, session),
        ),
      );
      return eventTicketTypesIds;
    });
  }

  getAllTicketTypeValues(): string[] {
    return TicketType.getAllValues();
  }
}
