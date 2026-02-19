export class EmptyOrderTicketsException extends Error {
  constructor() {
    super('Order must contain at least one ticket');
    this.name = 'EmptyOrderTicketsException';
  }
}
