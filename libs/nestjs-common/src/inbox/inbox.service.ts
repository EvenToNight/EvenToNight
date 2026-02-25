import { Inject, Injectable } from '@nestjs/common';
import {
  INBOX_REPOSITORY,
  InboxServiceImpl as InboxServiceBase,
  type InboxRepository,
} from '@libs/ts-common';

@Injectable()
export class InboxService extends InboxServiceBase {
  constructor(
    @Inject(INBOX_REPOSITORY)
    inboxRepository: InboxRepository,
  ) {
    super(inboxRepository);
  }
}
