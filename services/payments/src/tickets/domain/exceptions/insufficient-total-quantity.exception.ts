import { DomainConflictException } from './domain-conflict.exception';

export class InsufficientTotalQuantityException extends DomainConflictException {
  constructor() {
    super('Total quantity cannot be less than sold quantity');
  }
}
