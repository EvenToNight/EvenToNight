export class TicketType {
  private constructor(private readonly value: string) {}

  //TODO: evaluate ticket type values needed
  static readonly STANDARD = new TicketType('STANDARD');
  static readonly VIP = new TicketType('VIP');

  static fromString(value: string): TicketType {
    //TODO: make case insensitive? [also for other vo]
    switch (value) {
      case 'STANDARD':
        return TicketType.STANDARD;
      case 'VIP':
        return TicketType.VIP;
      default:
        throw new Error(
          `Invalid TicketType: ${value}. Must be one of: STANDARD, VIP, EARLY_BIRD, STUDENT, GROUP`,
        );
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
