import { ClientSession } from 'mongoose';
import { MongoTransactionManager } from '@libs/ts-common/src/database/mongodb/mongo-transaction.manager';

export class BaseMongoRepository {
  protected getSession(): ClientSession | undefined {
    return MongoTransactionManager.getCurrentSession();
  }

  isDuplicateError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    );
  }
}
