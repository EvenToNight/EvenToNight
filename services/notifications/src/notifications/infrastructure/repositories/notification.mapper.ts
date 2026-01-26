import { Notification } from "../../domain/aggregates/notification.aggregate";
import { NotificationId } from "../../domain/value-objects/notification-id.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { NotificationDocument } from "./notification.schema";

export class NotificationMapper {
  static toDomain(doc: NotificationDocument): Notification {
    const notificationId = NotificationId.fromString(doc._id);
    const userId = UserId.fromString(doc.userId);

    return Notification.create(notificationId, {
      userId,
      read: doc.read,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(
    notification: Notification,
  ): Partial<NotificationDocument> {
    return {
      _id: notification.getId().toString(),
      userId: notification.getUserId().toString(),
      read: notification.isRead(),
      createdAt: notification.getCreatedAt(),
      updatedAt: notification.getUpdatedAt(),
    };
  }
}
