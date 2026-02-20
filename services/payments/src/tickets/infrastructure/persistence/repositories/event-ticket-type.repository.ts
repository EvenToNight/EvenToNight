import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventTicketType } from '../../../domain/aggregates/event-ticket-type.aggregate';
import { EventTicketTypeRepository } from '../../../domain/repositories/event-ticket-type.repository.interface';
import { EventTicketTypeMapper } from '../mappers/event-ticket-type.mapper';
import { EventTicketTypeDocument } from '../schemas/event-ticket-type.schema';
import { PaginatedResult, PaginationParams } from '@libs/ts-common';
import { Pagination } from '@libs/ts-common';
import { CurrencyConverter } from '@libs/ts-common';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { BaseMongoRepository } from '@libs/ts-common';
import { EventTicketTypeNotFoundException } from 'src/tickets/domain/exceptions/event-ticket-type-not-found.exception';

@Injectable()
export class EventTicketTypeRepositoryImpl
  extends BaseMongoRepository
  implements EventTicketTypeRepository
{
  constructor(
    @InjectModel(EventTicketTypeDocument.name)
    private readonly model: Model<EventTicketTypeDocument>,
  ) {
    super();
  }

  async save(ticketType: EventTicketType): Promise<EventTicketType> {
    const session = this.getSession();

    const document = EventTicketTypeMapper.toPersistence(ticketType);
    const created = new this.model(document);
    const saved = await created.save({ session: session || undefined });
    return EventTicketTypeMapper.toDomain(saved);
  }

  async findById(id: string): Promise<EventTicketType | null> {
    const session = this.getSession();
    const document = await this.model
      .findById(id)
      .session(session || null)
      .exec();
    return document ? EventTicketTypeMapper.toDomain(document) : null;
  }

  async findByEventId(eventId: string): Promise<EventTicketType[]> {
    const session = this.getSession();
    const documents = await this.model
      .find({ eventId })
      .session(session || null)
      .exec();
    return documents.map((doc) => EventTicketTypeMapper.toDomain(doc));
  }

  async update(ticketType: EventTicketType): Promise<EventTicketType> {
    const session = this.getSession();
    const document = EventTicketTypeMapper.toPersistence(ticketType);
    const updated = await this.model
      .findByIdAndUpdate(ticketType.getId(), document, { new: true })
      .session(session || null)
      .exec();

    if (!updated) {
      throw new EventTicketTypeNotFoundException(ticketType.getId().toString());
    }

    return EventTicketTypeMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const session = this.getSession();

    await this.model
      .findByIdAndDelete(id)
      .session(session || null)
      .exec();
  }

  async deleteAll(): Promise<void> {
    const session = this.getSession();

    await this.model
      .deleteMany({})
      .session(session || null)
      .exec();
  }

  async findEventIds(params?: {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    sortOrder?: 'asc' | 'desc';
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<EventId>> {
    const session = this.getSession();

    const allTicketTypes = await this.model
      .find()
      .session(session || null)
      .exec();
    const pagination = Pagination.parse(
      params?.pagination?.limit,
      params?.pagination?.offset,
    );

    const eventIdsSet = new Set<string>();

    for (const ticket of allTicketTypes) {
      const convertedPrice = await CurrencyConverter.convertAmount(
        ticket.price.amount,
        ticket.price.currency,
        params?.currency || 'USD',
      );

      const meetsMinPrice =
        params?.minPrice === undefined || convertedPrice >= params.minPrice;
      const meetsMaxPrice =
        params?.maxPrice === undefined || convertedPrice <= params.maxPrice;

      if (meetsMinPrice && meetsMaxPrice) {
        eventIdsSet.add(ticket.eventId);
      }
    }

    const allEventIds: EventId[] = Array.from(eventIdsSet).map((id) =>
      EventId.fromString(id),
    );
    const totalItems = allEventIds.length;
    const paginatedEventIds = allEventIds.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    );

    return Pagination.createResult(paginatedEventIds, totalItems, pagination);
  }
}
