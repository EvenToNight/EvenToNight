import { Notification } from "../../domain/aggregates/notification.aggregate";

export class NotificationDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly metadata: Record<string, any>,
    public readonly read: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(notification: Notification): NotificationDto {
    return new NotificationDto(
      notification.id.toString(),
      notification.userId.toString(),
      notification.type.toString(),
      notification.content.metadata,
      notification.isRead,
      notification.createdAt,
      notification.updatedAt,
    );
  }

  toJson() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      metadata: this.metadata,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
