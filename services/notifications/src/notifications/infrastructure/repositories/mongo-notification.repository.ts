import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { Notification } from "../../domain/aggregates/notification.aggregate";
import { NotificationModel } from "./notification.schema";
import { NotificationMapper } from "./notification.mapper";

export class MongoNotificationRepository implements NotificationRepository {
  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification);
    await NotificationModel.create(data);
  }
}
