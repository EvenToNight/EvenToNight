export class InvalidEventStatusException extends Error {
  constructor(value: string) {
    super(`Invalid EventStatus: ${value}`);
    this.name = 'InvalidEventStatusException';
  }
}
