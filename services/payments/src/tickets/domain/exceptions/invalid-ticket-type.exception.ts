export class InvalidTicketTypeException extends Error {
  constructor(value: string) {
    super(`Invalid TicketType: ${value}`);
    this.name = 'InvalidTicketTypeException';
  }
}
