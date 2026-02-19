export class NegativeSoldQuantityException extends Error {
  constructor() {
    super('Sold quantity cannot be negative');
    this.name = 'NegativeSoldQuantityException';
  }
}
