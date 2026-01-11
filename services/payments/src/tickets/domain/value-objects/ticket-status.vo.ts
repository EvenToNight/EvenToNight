export class TicketStatus {
  private constructor(private readonly value: string) {}

  //TODO: evaluate ticket status values needed
  static readonly ACTIVE = new TicketStatus('ACTIVE');
  static readonly CANCELLED = new TicketStatus('CANCELLED');
  static readonly REFUNDED = new TicketStatus('REFUNDED');

  static fromString(value: string): TicketStatus {
    switch (value) {
      case 'ACTIVE':
        return TicketStatus.ACTIVE;
      case 'CANCELLED':
        return TicketStatus.CANCELLED;
      case 'REFUNDED':
        return TicketStatus.REFUNDED;
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

  isActive(): boolean {
    return this.equals(TicketStatus.ACTIVE);
  }

  isCancelled(): boolean {
    return this.equals(TicketStatus.CANCELLED);
  }

  isRefunded(): boolean {
    return this.equals(TicketStatus.REFUNDED);
  }
}
