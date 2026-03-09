import { DomainValidationException } from './domain-validation.exception';

export class EmptyUserIdException extends DomainValidationException {
  constructor() {
    super('UserId cannot be empty');
  }
}
