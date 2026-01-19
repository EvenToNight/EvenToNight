export class EventId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EventId cannot be empty');
    }
  }

  static fromString(value: string): EventId {
    return new EventId(value);
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
