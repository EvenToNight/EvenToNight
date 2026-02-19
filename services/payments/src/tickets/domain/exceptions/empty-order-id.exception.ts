export class EmptyOrderIdException extends Error {
  constructor() {
    super('OrderId cannot be empty');
    this.name = 'EmptyOrderIdException';
  }
}
