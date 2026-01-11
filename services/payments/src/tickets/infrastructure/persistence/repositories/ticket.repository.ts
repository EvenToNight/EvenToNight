import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../../../domain/aggregates/ticket.aggregate';
import { TicketRepository } from '../../../domain/repositories/ticket.repository.interface';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketDocument } from '../schemas/ticket.schema';

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

  async findByUserId(userId: string): Promise<Ticket[]> {
    const documents = await this.ticketModel
      .find({ userId })
      .sort({ purchaseDate: -1 })
      .exec();
    return documents.map((doc) => TicketMapper.toDomain(doc));
  }

  async findByEventId(eventId: string): Promise<Ticket[]> {
    const documents = await this.ticketModel
      .find({ eventId })
      .sort({ purchaseDate: -1 })
      .exec();
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
}
