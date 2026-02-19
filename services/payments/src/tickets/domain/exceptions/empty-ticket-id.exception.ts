export class EmptyTicketIdException extends Error {
  constructor() {
    super('TicketId cannot be empty');
    this.name = 'EmptyTicketIdException';
  }
}
