export class CreateNotificationFromEventCommand {
  private constructor(
    public readonly type: string,
    public readonly metadata: Record<string, any>,
    public readonly recipientUserId?: string,
  ) {
    this.validate();
  }

  static create(data: {
    recipientUserId?: string;
    type: string;
    metadata: Record<string, any>;
  }): CreateNotificationFromEventCommand {
    return new CreateNotificationFromEventCommand(
      data.type,
      data.metadata,
      data.recipientUserId,
    );
  }

  private validate() {
    if (!this.type) {
      throw new Error("Notification type is required");
    }
    if (!this.metadata || typeof this.metadata !== "object") {
      throw new Error("metadata is required and must be an object");
    }
  }
}
