export class NotificationContent {
  private constructor(private readonly _metadata: Record<string, any>) {
    this.validate();
  }

  static create(metadata: Record<string, any>): NotificationContent {
    return new NotificationContent(metadata);
  }

  private validate(): void {
    if (!this._metadata || typeof this._metadata !== "object") {
      throw new Error("Notification metadata must be an object");
    }
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  toJson(): Record<string, any> {
    return this._metadata;
  }
}
