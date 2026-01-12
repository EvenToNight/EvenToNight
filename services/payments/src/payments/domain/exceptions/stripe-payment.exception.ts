export class StripePaymentException extends Error {
  constructor(
    message: string,
    public readonly stripeErrorCode?: string,
  ) {
    super(message);
    this.name = 'StripePaymentException';
  }
}
