import { NotificationRepository } from "../../../../domain/repositories/notification.repository.interface";
import { Notification } from "../../../../domain/aggregates/notification.aggregate";
import { NotificationModel } from "../schemas/notification.schema";
import { NotificationMapper } from "../mappers/notification.mapper";

export class MongoNotificationRepository implements NotificationRepository {
  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification);
    await NotificationModel.create(data);
  }
}
