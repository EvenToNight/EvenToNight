import { DomainConflictException } from './domain-conflict.exception';

export class InvalidTicketStatusException extends DomainConflictException {
  constructor(currentStatus: string, attemptedOperation: string) {
    super(`Cannot ${attemptedOperation} ticket with status ${currentStatus}`);
  }
}
