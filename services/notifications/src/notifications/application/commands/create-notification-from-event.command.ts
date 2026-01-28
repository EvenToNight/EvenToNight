export class CreateNotificationFromEventCommand {
  private constructor(
    public readonly recipientUserId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
  ) {
    this.validate();
  }

  static create(data: {
    recipientUserId: string;
    type: string;
    title: string;
    message: string;
  }): CreateNotificationFromEventCommand {
    return new CreateNotificationFromEventCommand(
      data.recipientUserId,
      data.type,
      data.title,
      data.message,
    );
  }

  private validate() {
    if (!this.recipientUserId) {
      throw new Error("Recipient user ID is required");
    }
    if (!this.type) {
      throw new Error("Notification type is required");
    }
    if (!this.title) {
      throw new Error("Notification title is required");
    }
    if (!this.message) {
      throw new Error("Notification message is required");
    }
  }
}
