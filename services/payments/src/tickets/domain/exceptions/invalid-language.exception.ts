export class InvalidLanguageException extends Error {
  constructor(value: string) {
    super(`Invalid language: ${value}`);
    this.name = 'InvalidLanguageException';
  }
}
