import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InboxMongoRepository as BaseInboxMongoRepository } from '@libs/ts-common';
import { InboxDocument } from './inbox.schema';

@Injectable()
export class InboxMongoRepository extends BaseInboxMongoRepository {
  constructor(
    @InjectModel(InboxDocument.name)
    inboxModel: Model<InboxDocument>,
  ) {
    super(inboxModel);
  }
}
