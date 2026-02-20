import { Model } from 'mongoose';
import { BaseMongoRepository } from '../database/mongodb/base-mongo.repository';
import type { OutboxRepository } from './outbox.repository.interface';
import type { OutboxDocument, OutboxEntry } from './outbox.types';

export class OutboxMongoRepository
  extends BaseMongoRepository
  implements OutboxRepository
{
  constructor(protected readonly outboxModel: Model<OutboxDocument>) {
    super();
  }

  async save(entry: OutboxEntry): Promise<void> {
    const session = this.getSession();
    const document = new this.outboxModel({
      _id: entry.id,
      eventType: entry.eventType,
      payload: entry.payload,
      occurredAt: entry.occurredAt,
      processedAt: null,
    });
    await document.save({ session: session || undefined });
  }

  async findUnprocessed(limit: number): Promise<OutboxEntry[]> {
    const documents = await this.outboxModel
      .find({ processedAt: null })
      .sort({ occurredAt: 1 })
      .limit(limit)
      .exec();
    return documents.map((doc) => ({
      id: doc._id,
      eventType: doc.eventType,
      payload: doc.payload,
      occurredAt: doc.occurredAt,
      processedAt: doc.processedAt,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.outboxModel
      .findByIdAndUpdate(id, { processedAt: new Date() })
      .exec();
  }

  async deleteProcessedBefore(date: Date): Promise<number> {
    const result = await this.outboxModel
      .deleteMany({ processedAt: { $ne: null, $lt: date } })
      .exec();
    return result.deletedCount;
  }
}
