export class EmptyEventIdException extends Error {
  constructor() {
    super('EventId cannot be empty');
    this.name = 'EmptyEventIdException';
  }
}
