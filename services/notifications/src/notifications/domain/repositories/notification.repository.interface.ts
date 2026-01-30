import { Notification } from "../aggregates/notification.aggregate";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findNotificationsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]>;
  countNotificationsByUserId(userId: string): Promise<number>;
}
