export class InvalidTicketStatusException extends Error {
  constructor(currentStatus: string, attemptedOperation: string) {
    super(`Cannot ${attemptedOperation} ticket with status ${currentStatus}`);
    this.name = 'InvalidTicketStatusException';
  }
}
