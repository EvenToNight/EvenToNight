export class NegativeAvailableQuantityException extends Error {
  constructor() {
    super('Available quantity cannot be negative');
    this.name = 'NegativeAvailableQuantityException';
  }
}
