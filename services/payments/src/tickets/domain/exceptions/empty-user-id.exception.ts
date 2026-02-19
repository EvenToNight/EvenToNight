export class EmptyUserIdException extends Error {
  constructor() {
    super('UserId cannot be empty');
    this.name = 'EmptyUserIdException';
  }
}
