export class InvalidTicketStatusValueException extends Error {
  constructor(value: string) {
    super(`Invalid TicketStatus: ${value}`);
    this.name = 'InvalidTicketStatusValueException';
  }
}
