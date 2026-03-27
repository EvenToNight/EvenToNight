import { DomainNotFoundException } from './domain-not-found.exception';

export class UserNotFoundException extends DomainNotFoundException {
  constructor(userId?: string) {
    super(userId ? `User with id ${userId} not found` : 'User not found');
  }
}
