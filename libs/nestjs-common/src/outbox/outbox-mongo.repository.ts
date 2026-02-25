import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxMongoRepository as BaseOutboxMongoRepository } from '@libs/ts-common';
import { OutboxDocument } from './outbox.schema';

@Injectable()
export class OutboxMongoRepository extends BaseOutboxMongoRepository {
  constructor(
    @InjectModel(OutboxDocument.name)
    outboxModel: Model<OutboxDocument>,
  ) {
    super(outboxModel);
  }
}
