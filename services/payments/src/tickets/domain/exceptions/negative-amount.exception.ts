export class NegativeAmountException extends Error {
  constructor() {
    super('Amount cannot be negative');
    this.name = 'NegativeAmountException';
  }
}
