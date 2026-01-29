import { Notification } from "../../domain/aggregates/notification.aggregate";

export class NotificationDto {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
    public readonly read: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(notification: Notification): NotificationDto {
    return new NotificationDto(
      notification.id.toString(),
      notification.userId.toString(),
      notification.type.toString(),
      notification.content.title,
      notification.content.message,
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
      title: this.title,
      message: this.message,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
