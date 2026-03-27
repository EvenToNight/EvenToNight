import type { OutboxRepository } from './outbox.repository.interface';
import type { OutboxRelayServiceInterface } from './outbox-relay.service.interface';
import type { MessagePublisher } from '../messaging/interfaces/message-publisher.interface';

export interface OutboxRelayLogger {
  log(message: string): void;
  error(message: string, error?: unknown): void;
  warn(message: string, error?: unknown): void;
}

export interface OutboxRelayOptions {
  fallbackPollIntervalMs?: number;
  batchSize?: number;
}

export class OutboxRelayServiceBase implements OutboxRelayServiceInterface {
  private fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
  protected readonly fallbackPollIntervalMs: number;
  protected readonly batchSize: number;
  private isProcessing = false;

  constructor(
    protected readonly outboxRepository: OutboxRepository,
    protected readonly eventPublisher: MessagePublisher,
    protected readonly logger: OutboxRelayLogger,
    options?: OutboxRelayOptions,
  ) {
    this.fallbackPollIntervalMs = options?.fallbackPollIntervalMs ?? 30000;
    this.batchSize = options?.batchSize ?? 50;
  }

  start(): void {
    this.startFallbackPolling();
    this.logger.log(
      `Outbox relay started (fallback polling every ${this.fallbackPollIntervalMs}ms)`,
    );
  }

  stop(): void {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
    this.logger.log('Outbox relay stopped');
  }

  private startFallbackPolling(): void {
    this.fallbackIntervalId = setInterval(() => {
      void this.processOutbox();
    }, this.fallbackPollIntervalMs);
  }

  protected async publishAndMark(entry: {
    id: string;
    eventType: string;
    payload: string;
  }): Promise<void> {
    try {
      const event = JSON.parse(entry.payload);
      await this.eventPublisher.publish(event, entry.eventType, entry.id);
      await this.outboxRepository.markProcessed(entry.id);
    } catch (error) {
      this.logger.error(`Failed to process outbox entry ${entry.id}`, error);
    }
  }

  private async processOutbox(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    try {
      const entries = await this.outboxRepository.findUnprocessed(
        this.batchSize,
      );

      if (entries.length === 0) {
        return;
      }

      this.logger.log(
        `Fallback polling: processing ${entries.length} outbox entries`,
      );

      for (const entry of entries) {
        await this.publishAndMark({
          id: entry.id,
          eventType: entry.eventType,
          payload: entry.payload,
        });
      }
    } catch (error) {
      this.logger.error('Failed to poll outbox', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
