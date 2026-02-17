import {
  TransactionManager,
  TransactionOptions,
} from '../interfaces/transaction-manager.interface';

interface WithTransactionManager {
  txManager?: TransactionManager;
  transactionManager?: TransactionManager;
}

export function Transactional(options?: TransactionOptions) {
  return function (
    target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      this: any,
      ...args: any[]
    ) => Promise<unknown>;

    if (typeof originalMethod !== 'function') {
      throw new Error(
        `@Transactional can only be applied to methods, not to ${typeof originalMethod}`,
      );
    }

    descriptor.value = async function (
      this: WithTransactionManager,
      ...args: any[]
    ): Promise<unknown> {
      const txManager: TransactionManager = (this.txManager ||
        this.transactionManager) as TransactionManager;

      if (!txManager) {
        const className = (target as { constructor: { name: string } })
          .constructor.name;
        throw new Error(
          `@Transactional requires a TransactionManager to be injected.\n` +
            `Class ${className} must have a field named 'txManager' or 'transactionManager'.\n` +
            `Example:\n` +
            `  constructor(private readonly txManager: TransactionManager) {}\n`,
        );
      }

      if (typeof txManager.executeInTransaction !== 'function') {
        throw new Error(
          `The injected txManager does not implement TransactionManager interface.\n` +
            `Make sure you're injecting TransactionManager, not a different type.`,
        );
      }

      return await txManager.executeInTransaction(
        () => originalMethod.apply(this, args) as Promise<unknown>,
        options,
      );
    };

    return descriptor;
  };
}
