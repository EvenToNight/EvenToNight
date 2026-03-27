import { Connection } from 'mongoose';
import type { ChangeStream } from 'mongodb';
import { OutboxRelayServiceBase, type OutboxRelayLogger, type OutboxRelayOptions } from './outbox-relay.service';
import type { OutboxRepository } from './outbox.repository.interface';
import type { MessagePublisher } from '../messaging/interfaces/message-publisher.interface';

export class OutboxChangeStreamRelayService extends OutboxRelayServiceBase {
  private changeStream: ChangeStream | null = null;

  constructor(
    outboxRepository: OutboxRepository,
    eventPublisher: MessagePublisher,
    logger: OutboxRelayLogger,
    private readonly connection: Connection,
    options?: OutboxRelayOptions,
  ) {
    super(outboxRepository, eventPublisher, logger, options);
  }

  override start(): void {
    this.startChangeStream();
    super.start();
  }

  override stop(): void {
    if (this.changeStream) {
      void this.changeStream.close();
      this.changeStream = null;
    }
    super.stop();
  }

  private startChangeStream(): void {
    try {
      const collection = this.connection.collection('outbox');
      this.changeStream = collection.watch(
        [{ $match: { operationType: 'insert' } }],
        { fullDocument: 'updateLookup' },
      );

      this.changeStream.on('change', (change: any) => {
        if (change.operationType === 'insert' && change.fullDocument) {
          const doc = change.fullDocument;
          void this.publishAndMark({
            id: doc._id,
            eventType: doc.eventType,
            payload: doc.payload,
          });
        }
      });

      this.changeStream.on('error', (error) => {
        this.logger.error(
          'Change stream error, relying on fallback polling',
          error,
        );
        this.changeStream = null;
        setTimeout(() => this.startChangeStream(), 10000);
      });
    } catch (error) {
      this.logger.warn(
        'Failed to start change stream, relying on fallback polling',
        error,
      );
    }
  }
}
