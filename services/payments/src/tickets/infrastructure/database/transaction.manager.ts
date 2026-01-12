import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);
  private readonly useTransactions = !!process.env.MONGO_HOST;

  constructor(@InjectConnection() private readonly connection: Connection) {
    if (!this.useTransactions) {
      this.logger.warn('⚠️  Transactions are DISABLED.');
    }
  }

  async executeInTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    if (!this.useTransactions) {
      return this.withSession(operation);
    }

    const session = await this.connection.startSession();
    try {
      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
      });

      const result = await operation(session);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async withSession<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();

    try {
      return await operation(session);
    } finally {
      await session.endSession();
    }
  }
}
