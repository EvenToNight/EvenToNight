import { Connection, ClientSession } from 'mongoose';
import { AsyncLocalStorage } from 'async_hooks';
import {
  TransactionManager,
  TransactionOptions,
} from '../interfaces/transaction-manager.interface';

interface RetryMetrics {
  attempt: number;
  error?: Error;
  willRetry: boolean;
}

export class MongoTransactionManager implements TransactionManager {
  private readonly useTransactions = !!process.env.MONGO_HOST;

  private static readonly sessionStorage =
    new AsyncLocalStorage<ClientSession>();

  constructor(
    private readonly connection: Connection,
    private readonly logger: Console = console,
  ) {
    if (!this.useTransactions) {
      this.logger.warn('⚠️ Transactions are DISABLED.');
    }
  }

  static getCurrentSession(): ClientSession | undefined {
    return MongoTransactionManager.sessionStorage.getStore();
  }

  async executeInTransaction<T>(
    operation: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    if (!this.useTransactions) {
      return operation();
    }

    const maxRetries = options.maxRetries ?? 3;
    const baseDelay = options.baseDelay ?? 100;
    const maxDelay = options.maxDelay ?? 5000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const session = await this.connection.startSession();

      try {
        session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary',
        });

        const result = await MongoTransactionManager.sessionStorage.run(
          session,
          async () => {
            return await operation();
          },
        );

        await session.commitTransaction();

        if (attempt > 0) {
          this.logger.log(
            `Transaction succeeded after ${attempt + 1} attempt(s)`,
          );
        }

        return result;
      } catch (error: any) {
        await session.abortTransaction();
        const shouldRetry = this.shouldRetry(attempt, maxRetries);
        if (error instanceof Error) {
          this.logRetryAttempt({
            attempt,
            error,
            willRetry: shouldRetry,
          });
        }

        if (shouldRetry) {
          const delay = this.calculateDelay(attempt, baseDelay, maxDelay);
          await this.sleep(delay);
          continue;
        }

        throw error;
      } finally {
        await session.endSession();
      }
    }

    const errorMsg = `Transaction failed after ${maxRetries} retries.`;
    this.logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  async withSession<T>(operation: () => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();

    try {
      return await MongoTransactionManager.sessionStorage.run(session, () =>
        operation(),
      );
    } finally {
      await session.endSession();
    }
  }

  private shouldRetry(attempt: number, maxRetries: number): boolean {
    return attempt < maxRetries - 1;
  }

  private calculateDelay(
    attempt: number,
    baseDelay: number,
    maxDelay: number,
  ): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    const delayWithJitter = exponentialDelay + jitter;
    return Math.min(delayWithJitter, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logRetryAttempt(metrics: RetryMetrics): void {
    const { attempt, error, willRetry } = metrics;
    if (willRetry) {
      this.logger.warn(
        `Transaction attempt ${attempt} failed with error: ${error}. Retrying...`,
      );
    } else {
      this.logger.error(
        `Transaction attempt ${attempt} failed with error: ${error}. Not retrying.`,
      );
    }
  }
}
