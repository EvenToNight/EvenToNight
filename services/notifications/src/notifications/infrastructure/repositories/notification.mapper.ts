import { Notification } from "../../domain/aggregates/notification.aggregate";
import { NotificationDocument } from "./notification.schema";

export class NotificationMapper {
  static toPersistence(
    notification: Notification,
  ): Partial<NotificationDocument> {
    return {
      _id: notification.id.toString(),
      userId: notification.userId.toString(),
      read: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
