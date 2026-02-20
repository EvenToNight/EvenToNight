import { Inject, Injectable } from '@nestjs/common';
import {
  OUTBOX_REPOSITORY,
  OutboxServiceBase,
  type OutboxRepository,
} from '@libs/ts-common';

@Injectable()
export class OutboxService extends OutboxServiceBase {
  constructor(
    @Inject(OUTBOX_REPOSITORY)
    outboxRepository: OutboxRepository,
  ) {
    super(outboxRepository);
  }
}
