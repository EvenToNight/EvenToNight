export class NotificationId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('NotificationId cannot be empty');
    }
  }

  static fromString(value: string): NotificationId {
    return new NotificationId(value);
  }

  static generate(): NotificationId {
    return new NotificationId(crypto.randomUUID());
  }

  equals(other: NotificationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
