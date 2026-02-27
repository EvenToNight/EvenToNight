import { PaymentException } from 'src/tickets/domain/exceptions/payment.exception';

describe('PaymentException', () => {
  it('should create with message', () => {
    const error = new PaymentException('payment failed');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('PaymentException');
    expect(error.message).toBe('payment failed');
    expect(error.errorCode).toBeUndefined();
  });

  it('should create with message and errorCode', () => {
    const error = new PaymentException('payment failed', 'CARD_DECLINED');
    expect(error.errorCode).toBe('CARD_DECLINED');
  });
});
