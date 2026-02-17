import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Ticket } from '../../../domain/aggregates/ticket.aggregate';
import { TicketRepository } from '../../../domain/repositories/ticket.repository.interface';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketDocument } from '../schemas/ticket.schema';
import {
  PaginatedResult,
  PaginationParams,
} from '@libs/ts-common/src/pagination/pagination.types';
import { Pagination } from '@libs/ts-common/src/pagination/pagination.utils';
import { EventId } from '../../../domain/value-objects/event-id.vo';
import { BaseMongoRepository } from './base-mongo.repository';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';

@Injectable()
export class TicketRepositoryImpl
  extends BaseMongoRepository
  implements TicketRepository
{
  constructor(
    @InjectModel(TicketDocument.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {
    super();
  }
  async save(ticket: Ticket): Promise<Ticket> {
    const session = this.getSession();

    const document = TicketMapper.toPersistence(ticket);
    const created = new this.ticketModel(document);
    const saved = await created.save({ session: session || undefined });
    return TicketMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Ticket | null> {
    const session = this.getSession();

    const document = await this.ticketModel
      .findById(id)
      .session(session || null)
      .exec();
    return document ? TicketMapper.toDomain(document) : null;
  }

  async findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    const session = this.getSession();

    const totalItems = await this.ticketModel.countDocuments({ userId }).exec();
    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const documents = await this.ticketModel
      .find({ userId })
      .sort({ purchaseDate: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset)
      .session(session || null)
      .exec();
    const items = documents.map((doc) => TicketMapper.toDomain(doc));
    return Pagination.createResult(items, totalItems, pagination);
  }

  async findByUserIdAndEventId(
    userId: string,
    eventId: string,
    status?: TicketStatus,
  ): Promise<Ticket[]> {
    const session = this.getSession();

    const filter: Record<string, string> = { userId, eventId };
    if (status) {
      filter.status = status.toString();
    }
    const documents = await this.ticketModel
      .find(filter)
      .sort({ purchaseDate: -1 })
      .session(session || null)
      .exec();
    return documents.map((doc) => TicketMapper.toDomain(doc));
  }

  async findEventsByUserId(
    userId: string,
    pagination?: PaginationParams,
    status?: string,
    order?: 'asc' | 'desc',
  ): Promise<PaginatedResult<EventId>> {
    const session = this.getSession();

    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const pipeline: PipelineStage[] = [
      { $match: { userId } },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
    ];

    if (status) {
      pipeline.push({ $match: { 'event.status': status } });
    }

    pipeline.push({
      $group: {
        _id: '$eventId',
        eventDate: { $first: '$event.date' },
      },
    });

    if (order) {
      pipeline.push({
        $sort: { eventDate: order === 'asc' ? 1 : -1 },
      });
    }

    const countPipeline: PipelineStage[] = [...pipeline, { $count: 'total' }];
    const countResult = await this.ticketModel
      .aggregate<{ total: number }>(countPipeline)
      .session(session || null)
      .exec();
    const totalItems = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: pagination.offset });
    pipeline.push({ $limit: pagination.limit });

    const results = await this.ticketModel
      .aggregate<{ _id: string; eventDate: Date }>(pipeline)
      .session(session || null)
      .exec();
    const paginatedEventIds = results.map((result) =>
      EventId.fromString(result._id),
    );

    return Pagination.createResult(paginatedEventIds, totalItems, pagination);
  }

  async findByEventId(
    eventId: string,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<Ticket>> {
    const session = this.getSession();

    const totalItems = await this.ticketModel
      .countDocuments({ eventId })
      .session(session || null)
      .exec();
    pagination = Pagination.parse(pagination?.limit, pagination?.offset);
    const documents = await this.ticketModel
      .find({ eventId })
      .sort({ purchaseDate: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset)
      .session(session || null)
      .exec();
    const items = documents.map((doc) => TicketMapper.toDomain(doc));
    return Pagination.createResult(items, totalItems, pagination);
  }

  async findByTicketTypeId(ticketTypeId: string): Promise<Ticket[]> {
    const session = this.getSession();

    const documents = await this.ticketModel
      .find({ ticketTypeId })
      .session(session || null)
      .exec();
    return documents.map((doc) => TicketMapper.toDomain(doc));
  }

  async update(ticket: Ticket): Promise<Ticket> {
    const session = this.getSession();

    const document = TicketMapper.toPersistence(ticket);
    const updated = await this.ticketModel
      .findByIdAndUpdate(ticket.getId(), document, { new: true })
      .session(session || null)
      .exec();

    if (!updated) {
      throw new Error(`Ticket with id ${ticket.getId()} not found`);
    }

    return TicketMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const session = this.getSession();

    await this.ticketModel
      .findByIdAndDelete(id)
      .session(session || null)
      .exec();
  }

  async deleteAll(): Promise<void> {
    const session = this.getSession();

    await this.ticketModel
      .deleteMany({})
      .session(session || null)
      .exec();
  }
}
