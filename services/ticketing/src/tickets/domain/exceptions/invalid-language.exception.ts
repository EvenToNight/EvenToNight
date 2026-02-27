import { DomainValidationException } from './domain-validation.exception';

export class InvalidLanguageException extends DomainValidationException {
  constructor(value: string) {
    super(`Invalid language: ${value}`);
  }
}
