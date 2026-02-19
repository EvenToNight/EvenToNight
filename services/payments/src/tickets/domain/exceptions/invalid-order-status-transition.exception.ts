export class InvalidOrderStatusTransitionException extends Error {
  constructor(currentStatus: string, action: string) {
    super(`Cannot ${action} order in status: ${currentStatus}`);
    this.name = 'InvalidOrderStatusTransitionException';
  }
}
