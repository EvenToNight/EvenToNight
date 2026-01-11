export class TicketStatus {
  private constructor(private readonly value: string) {}

  //TODO: evaluate ticket status values needed
  static readonly PENDING_PAYMENT = new TicketStatus('PENDING_PAYMENT');
  static readonly ACTIVE = new TicketStatus('ACTIVE');
  static readonly CANCELLED = new TicketStatus('CANCELLED');
  static readonly REFUNDED = new TicketStatus('REFUNDED');
  static readonly PAYMENT_FAILED = new TicketStatus('PAYMENT_FAILED');

  static fromString(value: string): TicketStatus {
    switch (value) {
      case 'PENDING_PAYMENT':
        return TicketStatus.PENDING_PAYMENT;
      case 'ACTIVE':
        return TicketStatus.ACTIVE;
      case 'CANCELLED':
        return TicketStatus.CANCELLED;
      case 'REFUNDED':
        return TicketStatus.REFUNDED;
      case 'PAYMENT_FAILED':
        return TicketStatus.PAYMENT_FAILED;
      default:
        throw new Error(`Invalid TicketStatus: ${value}`);
    }
  }

  equals(other: TicketStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isPendingPayment(): boolean {
    return this.equals(TicketStatus.PENDING_PAYMENT);
  }

  isActive(): boolean {
    return this.equals(TicketStatus.ACTIVE);
  }

  isCancelled(): boolean {
    return this.equals(TicketStatus.CANCELLED);
  }

  isRefunded(): boolean {
    return this.equals(TicketStatus.REFUNDED);
  }

  isPaymentFailed(): boolean {
    return this.equals(TicketStatus.PAYMENT_FAILED);
  }
}
