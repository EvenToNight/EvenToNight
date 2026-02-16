export interface TransactionOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface TransactionManager {
  executeInTransaction<T>(
    operation: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;

  withSession<T>(operation: () => Promise<T>): Promise<T>;
}

export const TRANSACTION_MANAGER = Symbol('TransactionManager');
