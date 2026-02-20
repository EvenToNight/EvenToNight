import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxMongoRepository } from '@libs/ts-common';
import { OutboxDocument } from './outbox.schema';

@Injectable()
export class OutboxRepositoryImpl extends OutboxMongoRepository{
  constructor(
    @InjectModel(OutboxDocument.name)
    outboxModel: Model<OutboxDocument>,
  ) {
    super(outboxModel);
  }
}
