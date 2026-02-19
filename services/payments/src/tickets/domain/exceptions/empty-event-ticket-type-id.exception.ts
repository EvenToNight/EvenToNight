export class EmptyEventTicketTypeIdException extends Error {
  constructor() {
    super('EventTicketTypeId cannot be empty');
    this.name = 'EmptyEventTicketTypeIdException';
  }
}
