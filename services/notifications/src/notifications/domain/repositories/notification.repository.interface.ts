import { Notification } from "../aggregates/notification.aggregate";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findNotificationsByUserId(
    userId: string,
    limit: number,
    offset: number,
    unreadOnly: boolean,
  ): Promise<Notification[]>;
  countNotificationsByUserId(
    userId: string,
    unreadOnly: boolean,
  ): Promise<number>;
  markAsRead(notificationId: string): Promise<void>;
}
