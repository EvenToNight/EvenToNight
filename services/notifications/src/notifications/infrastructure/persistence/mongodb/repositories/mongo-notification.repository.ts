import { NotificationRepository } from "../../../../domain/repositories/notification.repository.interface";
import { Notification } from "../../../../domain/aggregates/notification.aggregate";
import { NotificationModel } from "../schemas/notification.schema";
import { NotificationMapper } from "../mappers/notification.mapper";

export class MongoNotificationRepository implements NotificationRepository {
  async save(notification: Notification): Promise<void> {
    const data = NotificationMapper.toPersistence(notification);
    await NotificationModel.create(data);
  }

  async findNotificationsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return docs.map((doc) => NotificationMapper.toDomain(doc));
  }

  async countNotificationsByUserId(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId }).exec();
  }
}
