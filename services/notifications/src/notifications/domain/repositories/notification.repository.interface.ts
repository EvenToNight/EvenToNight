import { Notification } from "../aggregates/notification.aggregate";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
}
