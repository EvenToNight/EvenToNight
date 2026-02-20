import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  OUTBOX_REPOSITORY,
  OutboxChangeStreamRelayService,
  type OutboxRepository,
} from '@libs/ts-common';
import { EventPublisher } from '../messaging/event-publisher.service';

@Injectable()
export class OutboxRelayService
  extends OutboxChangeStreamRelayService
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(OUTBOX_REPOSITORY)
    outboxRepository: OutboxRepository,
    eventPublisher: EventPublisher,
    @InjectConnection()
    connection: Connection,
  ) {
    const logger = new Logger(OutboxRelayService.name);
    super(outboxRepository, eventPublisher, logger, connection, {
      fallbackPollIntervalMs: parseInt(
        process.env.OUTBOX_FALLBACK_POLL_INTERVAL_MS || '30000',
        10,
      ),
      batchSize: parseInt(process.env.OUTBOX_BATCH_SIZE || '50', 10),
    });
  }

  onModuleInit(): void {
    this.start();
  }

  onModuleDestroy(): void {
    this.stop();
  }
}
