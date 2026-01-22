import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../../../domain/aggregates/ticket.aggregate';
import { TicketRepository } from '../../../domain/repositories/ticket.repository.interface';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketDocument } from '../schemas/ticket.schema';
import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';
import { Pagination } from 'src/commons/utils/pagination.utils';
import { EventId } from '../../../domain/value-objects/event-id.vo';

@Injectable()
export class TicketRepositoryImpl implements TicketRepository {
  constructor(
    @InjectModel(TicketDocument.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async save(ticket: Ticket): Promise<Ticket> {
    const document = TicketMapper.toPersistence(ticket);
    const created = new this.ticketModel(document);
    const saved = await created.save();
    return TicketMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Ticket | null> {
    const document = await this.ticketModel.findById(id).exec();
    return document ? TicketMapper.toDomain(document) : null;
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    const totalItems = await this.ticketModel.countDocuments({ userId }).exec();
    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const documents = await this.ticketModel
      .find({ userId })
      .sort({ purchaseDate: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset)
      .exec();
    const items = documents.map((doc) => TicketMapper.toDomain(doc));
    return Pagination.createResult(items, totalItems, pagination);
  }

  async findByUserIdAndEventId(
    userId: string,
    eventId: string,
  ): Promise<Ticket[]> {
    const documents = await this.ticketModel
      .find({ userId, eventId })
      .sort({ purchaseDate: -1 })
      .exec();
    return documents.map((doc) => TicketMapper.toDomain(doc));
  }

  async findEventsByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<EventId>> {
    const distinctEventIds = await this.ticketModel
      .distinct('eventId', { userId })
      .exec();
    const totalItems = distinctEventIds.length;
    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const paginatedEventIds = distinctEventIds
      .slice(pagination.offset, pagination.offset + pagination.limit)
      .map((id: string) => EventId.fromString(id));
    return Pagination.createResult(paginatedEventIds, totalItems, pagination);
  }

  async findByEventId(
    eventId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    const totalItems = await this.ticketModel
      .countDocuments({ eventId })
      .exec();
    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const documents = await this.ticketModel
      .find({ eventId })
      .sort({ purchaseDate: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset)
      .exec();
    const items = documents.map((doc) => TicketMapper.toDomain(doc));
    return Pagination.createResult(items, totalItems, pagination);
  }

  async findByTicketTypeId(ticketTypeId: string): Promise<Ticket[]> {
    const documents = await this.ticketModel.find({ ticketTypeId }).exec();
    return documents.map((doc) => TicketMapper.toDomain(doc));
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const document = TicketMapper.toPersistence(ticket);
    const updated = await this.ticketModel
      .findByIdAndUpdate(ticket.getId(), document, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Ticket with id ${ticket.getId()} not found`);
    }

    return TicketMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.ticketModel.findByIdAndDelete(id).exec();
  }

  async deleteAll(): Promise<void> {
    await this.ticketModel.deleteMany({}).exec();
  }
}
