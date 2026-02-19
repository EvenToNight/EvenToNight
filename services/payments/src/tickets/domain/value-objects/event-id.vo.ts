import { EmptyEventIdException } from '../exceptions/empty-event-id.exception';

export class EventId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new EmptyEventIdException();
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
