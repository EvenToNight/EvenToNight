export class EventStatus {
  private constructor(private readonly value: string) {}

  static readonly DRAFT = new EventStatus('DRAFT');
  static readonly PUBLISHED = new EventStatus('PUBLISHED');
  static readonly COMPLETED = new EventStatus('COMPLETED');
  static readonly CANCELLED = new EventStatus('CANCELLED');

  static fromString(value: string): EventStatus {
    switch (value) {
      case 'DRAFT':
        return EventStatus.DRAFT;
      case 'PUBLISHED':
        return EventStatus.PUBLISHED;
      case 'COMPLETED':
        return EventStatus.COMPLETED;
      case 'CANCELLED':
        return EventStatus.CANCELLED;
      default:
        throw new Error(`Invalid EventStatus: ${value}`);
    }
  }

  static getAllStatuses(): EventStatus[] {
    return [
      EventStatus.DRAFT,
      EventStatus.PUBLISHED,
      EventStatus.COMPLETED,
      EventStatus.CANCELLED,
    ];
  }

  static getAllValues(): string[] {
    return ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED'];
  }

  equals(other: EventStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isDraft(): boolean {
    return this.equals(EventStatus.DRAFT);
  }

  isPublished(): boolean {
    return this.equals(EventStatus.PUBLISHED);
  }

  isCompleted(): boolean {
    return this.equals(EventStatus.COMPLETED);
  }

  isCancelled(): boolean {
    return this.equals(EventStatus.CANCELLED);
  }
}
