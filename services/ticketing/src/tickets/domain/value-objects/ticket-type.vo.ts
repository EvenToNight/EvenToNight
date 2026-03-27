import { InvalidTicketTypeException } from '../exceptions/invalid-ticket-type.exception';

export class TicketType {
  private constructor(private readonly value: string) {}

  static readonly STANDARD = new TicketType('STANDARD');
  static readonly VIP = new TicketType('VIP');

  static fromString(value: string): TicketType {
    switch (value.toUpperCase()) {
      case 'STANDARD':
        return TicketType.STANDARD;
      case 'VIP':
        return TicketType.VIP;
      default:
        throw new InvalidTicketTypeException(value);
    }
  }

  static getAllTypes(): TicketType[] {
    return [TicketType.STANDARD, TicketType.VIP];
  }

  static getAllValues(): string[] {
    return ['STANDARD', 'VIP'];
  }

  toString(): string {
    return this.value;
  }

  equals(other: TicketType): boolean {
    return this.value === other.value;
  }

  isStandard(): boolean {
    return this === TicketType.STANDARD;
  }

  isVip(): boolean {
    return this === TicketType.VIP;
  }
}
