import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { EventTicketType } from '../../../domain/aggregates/event-ticket-type.aggregate';
import { EventTicketTypeRepository } from '../../../domain/repositories/event-ticket-type.repository.interface';
import { EventTicketTypeMapper } from '../mappers/event-ticket-type.mapper';
import { EventTicketTypeDocument } from '../schemas/event-ticket-type.schema';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';
import { Pagination } from 'src/commons/utils/pagination.utils';
import { CurrencyConverter } from 'src/commons/utils/currency-converter.utils';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';

@Injectable()
export class EventTicketTypeRepositoryImpl implements EventTicketTypeRepository {
  constructor(
    @InjectModel(EventTicketTypeDocument.name)
    private readonly model: Model<EventTicketTypeDocument>,
  ) {}

  async save(ticketType: EventTicketType): Promise<EventTicketType> {
    const document = EventTicketTypeMapper.toPersistence(ticketType);
    // Passa esplicitamente l'_id per evitare che Mongoose generi un ObjectId
    const created = new this.model({
      ...document,
      _id: ticketType.getId(),
    });
    const saved = await created.save();
    return EventTicketTypeMapper.toDomain(saved);
  }

  async findById(id: string): Promise<EventTicketType | null> {
    const document = await this.model.findById(id).exec();
    return document ? EventTicketTypeMapper.toDomain(document) : null;
  }

  async findByEventId(eventId: string): Promise<EventTicketType[]> {
    const documents = await this.model.find({ eventId }).exec();
    return documents.map((doc) => EventTicketTypeMapper.toDomain(doc));
  }

  async update(ticketType: EventTicketType): Promise<EventTicketType> {
    const document = EventTicketTypeMapper.toPersistence(ticketType);
    const updated = await this.model
      .findByIdAndUpdate(ticketType.getId(), document, { new: true })
      .exec();

    if (!updated) {
      throw new Error(
        `EventTicketType with id ${ticketType.getId()} not found`,
      );
    }

    return EventTicketTypeMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.model.deleteMany({}).exec();
  }

  /**
   * Pessimistic locking: Finds a ticket type within a transaction session.
   * MongoDB will acquire a lock on the document for the duration of the transaction.
   */
  async findByIdWithLock(
    id: string,
    session: ClientSession,
  ): Promise<EventTicketType | null> {
    const document = await this.model.findById(id).session(session).exec();

    return document ? EventTicketTypeMapper.toDomain(document) : null;
  }

  async findByEventIdWithLock(
    eventId: string,
    session: ClientSession,
  ): Promise<EventTicketType[]> {
    const documents = await this.model
      .find({ eventId })
      .session(session)
      .exec();
    return documents.map((doc) => EventTicketTypeMapper.toDomain(doc));
  }

  async saveWithLock(
    ticketType: EventTicketType,
    session: ClientSession,
  ): Promise<EventTicketType> {
    const document = EventTicketTypeMapper.toPersistence(ticketType);
    // Passa esplicitamente l'_id per evitare che Mongoose generi un ObjectId
    const created = new this.model({
      ...document,
      _id: ticketType.getId(),
    });
    const saved = await created.save({ session });
    return EventTicketTypeMapper.toDomain(saved);
  }

  async findEventIds(params?: {
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    sortOrder?: 'asc' | 'desc';
    pagination?: PaginationParams;
  }): Promise<PaginatedResult<EventId>> {
    const allTicketTypes = await this.model.find().exec();
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

    return Pagination.createResult(allEventIds, totalItems, pagination);
  }
}
