export interface NotificationContentProps {
  title: string;
  message: string;
}

export class NotificationContent {
  private constructor(
    private readonly _title: string,
    private readonly _message: string,
    // TODO: private readonly _metadata?: Record<string, any>
  ) {
    this.validate();
  }

  static create(props: NotificationContentProps): NotificationContent {
    return new NotificationContent(props.title, props.message);
  }

  private validate(): void {
    if (!this._title || this._title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
    if (!this._message || this._message.trim() === "") {
      throw new Error("Message cannot be empty");
    }
  }

  get title(): string {
    return this._title;
  }

  get message(): string {
    return this._message;
  }

  toJson(): object {
    return {
      title: this._title,
      message: this._message,
    };
  }
}
