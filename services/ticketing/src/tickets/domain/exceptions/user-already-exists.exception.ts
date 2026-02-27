import { DomainConflictException } from './domain-conflict.exception';

export class UserAlreadyExistsException extends DomainConflictException {
  constructor(userId: string) {
    super(`User with id ${userId} already exists`);
  }
}
