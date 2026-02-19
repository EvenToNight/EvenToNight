export class InvalidOrderStatusException extends Error {
  constructor(value: string) {
    super(`Invalid OrderStatus: ${value}`);
    this.name = 'InvalidOrderStatusException';
  }
}
