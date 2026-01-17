export class PaymentException extends Error {
  constructor(
    message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'PaymentException';
  }
}
