export class OrderStatus {
  static readonly PENDING = new OrderStatus('PENDING');
  static readonly COMPLETED = new OrderStatus('COMPLETED');
  static readonly CANCELLED = new OrderStatus('CANCELLED');
  static readonly EXPIRED = new OrderStatus('EXPIRED');

  private constructor(private readonly value: string) {}

  static fromString(value: string): OrderStatus {
    switch (value) {
      case 'PENDING':
        return OrderStatus.PENDING;
      case 'COMPLETED':
        return OrderStatus.COMPLETED;
      case 'CANCELLED':
        return OrderStatus.CANCELLED;
      case 'EXPIRED':
        return OrderStatus.EXPIRED;
      default:
        throw new Error(`Invalid order status: ${value}`);
    }
  }

  static getAllValues(): string[] {
    return ['PENDING', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
  }

  toString(): string {
    return this.value;
  }

  isPending(): boolean {
    return this.value === 'PENDING';
  }

  isCompleted(): boolean {
    return this.value === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this.value === 'CANCELLED';
  }

  isExpired(): boolean {
    return this.value === 'EXPIRED';
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
