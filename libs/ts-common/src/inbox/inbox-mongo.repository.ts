import { Model } from 'mongoose';
import { BaseMongoRepository } from '../database/mongodb/base-mongo.repository';
import { InboxRepository } from './inbox.repository.interface';
import { InboxDocument, InboxEntry } from './inbox.types';

export class InboxMongoRepository
  extends BaseMongoRepository
  implements InboxRepository
{
  constructor(protected readonly inboxModel: Model<InboxDocument>) {
    super();
  }
  async save(entry: InboxEntry): Promise<void> {
    const session = this.getSession();
    const document = new this.inboxModel({
      _id: entry.id,
      processedAt: entry.processedAt,
    });
    await document.save({ session: session || undefined });
  }
  async find(key: string): Promise<InboxEntry | null> {
    const session = this.getSession();
    const doc = await this.inboxModel.findOne({ _id: key }).session(session || null).exec();
    if (!doc) return null;
    return { id: doc._id, processedAt: doc.processedAt };
  }
}
