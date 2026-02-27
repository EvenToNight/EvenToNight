import { DomainConflictException } from './domain-conflict.exception';

export class InvalidOrderStatusTransitionException extends DomainConflictException {
  constructor(currentStatus: string, action: string) {
    super(`Cannot ${action} order in status: ${currentStatus}`);
  }
}
