import { Notification } from "../../../../domain/aggregates/notification.aggregate";
import { NotificationDocument } from "../schemas/notification.schema";
import { NotificationId } from "../../../../domain/value-objects/notification-id.vo";
import { UserId } from "../../../../domain/value-objects/user-id.vo";
import { NotificationType } from "../../../../domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../../../domain/value-objects/notification-content.vo";

export class NotificationMapper {
  static toPersistence(
    notification: Notification,
  ): Partial<NotificationDocument> {
    return {
      _id: notification.id.toString(),
      userId: notification.userId.toString(),
      type: notification.type.toString(),
      metadata: notification.content.metadata,
      read: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  static toDomain(doc: NotificationDocument): Notification {
    return Notification.fromPersistence(NotificationId.fromString(doc._id), {
      userId: UserId.fromString(doc.userId),
      type: NotificationType.fromString(doc.type),
      content: NotificationContent.create(doc.metadata),
      read: doc.read,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
