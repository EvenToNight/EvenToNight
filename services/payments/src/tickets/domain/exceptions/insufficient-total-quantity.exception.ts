export class InsufficientTotalQuantityException extends Error {
  constructor() {
    super('Total quantity cannot be less than sold quantity');
    this.name = 'InsufficientTotalQuantityException';
  }
}
