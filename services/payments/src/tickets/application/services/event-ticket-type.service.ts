import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { EventTicketTypeRepository } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import { EVENT_TICKET_TYPE_REPOSITORY } from 'src/tickets/domain/repositories/event-ticket-type.repository.interface';
import {
  EventTicketType,
  EventTicketTypeCreateParams,
} from 'src/tickets/domain/aggregates/event-ticket-type.aggregate';
import { TicketType } from 'src/tickets/domain/value-objects/ticket-type.vo';
import { UpdateEventTicketTypeDto } from '../dto/update-event-ticket-type.dto';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from '@libs/ts-common/src/database/interfaces/transaction-manager.interface';
import { Transactional } from '@libs/ts-common/src/database/decorators/transactional.decorator';

@Injectable()
export class EventTicketTypeService {
  constructor(
    @Inject(EVENT_TICKET_TYPE_REPOSITORY)
    private readonly eventTicketTypeRepository: EventTicketTypeRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  create(params: EventTicketTypeCreateParams): Promise<EventTicketType> {
    const ticketType = EventTicketType.create(params);
    return this.eventTicketTypeRepository.save(ticketType);
  }

  @Transactional()
  update(ticketType: EventTicketType): Promise<EventTicketType> {
    return this.eventTicketTypeRepository.update(ticketType);
  }

  save(ticketType: EventTicketType): Promise<EventTicketType> {
    return this.eventTicketTypeRepository.save(ticketType);
  }

  deleteAll(): Promise<void> {
    return this.eventTicketTypeRepository.deleteAll();
  }

  async updateTicket(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    return this.transactionManager.executeInTransaction(async () => {
      const ticketType = await this.findById(id);
      if (!ticketType) {
        throw new Error(`EventTicketType with id ${id} not found`);
      }
      if (dto.description) ticketType.setDescription(dto.description);

      ticketType.setPrice(Money.fromAmount(dto.price, 'USD'));
      ticketType.setTotalQuantity(dto.quantity);
      return this.eventTicketTypeRepository.update(ticketType);
    });
  }

  async updateTicketAndMakeSoldOut(
    id: string,
    dto: UpdateEventTicketTypeDto,
  ): Promise<EventTicketType> {
    return this.transactionManager.executeInTransaction(async () => {
      const ticketType = await this.findById(id);
      if (!ticketType) {
        throw new Error(`EventTicketType with id ${id} not found`);
      }
      dto.quantity = ticketType.getSoldQuantity();
      if (dto.description) ticketType.setDescription(dto.description);
      if (dto.price) ticketType.setPrice(Money.fromAmount(dto.price, 'USD'));
      if (dto.quantity) ticketType.setTotalQuantity(dto.quantity);
      return this.eventTicketTypeRepository.update(ticketType);
    });
  }

  findById(id: string): Promise<EventTicketType | null> {
    return this.eventTicketTypeRepository.findById(id);
  }

  findByEventId(eventId: string): Promise<EventTicketType[]> {
    return this.eventTicketTypeRepository.findByEventId(eventId);
  }

  @Transactional()
  delete(id: string): Promise<void> {
    return this.eventTicketTypeRepository.delete(id);
  }

  @Transactional()
  async deleteEventTicketTypes(eventId: string): Promise<string[]> {
    const eventTicketTypesIds = (
      await this.eventTicketTypeRepository.findByEventId(eventId)
    ).map((t) => t.getId());
    await Promise.all(
      eventTicketTypesIds.map((ttId) =>
        this.eventTicketTypeRepository.delete(ttId),
      ),
    );
    return eventTicketTypesIds;
  }

  getAllTicketTypeValues(): string[] {
    return TicketType.getAllValues();
  }

  findEventIds(params?: {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    sortOrder?: 'asc' | 'desc';
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<EventId>> {
    return this.eventTicketTypeRepository.findEventIds(params);
  }
}
