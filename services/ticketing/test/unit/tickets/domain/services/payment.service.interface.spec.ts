import { PAYMENT_SERVICE } from 'src/tickets/domain/services/payment.service.interface';

describe('PaymentService', () => {
  it('should export PAYMENT_SERVICE token', () => {
    expect(typeof PAYMENT_SERVICE).toBe('symbol');
    expect(PAYMENT_SERVICE.toString()).toBe('Symbol(PAYMENT_SERVICE)');
  });
});
