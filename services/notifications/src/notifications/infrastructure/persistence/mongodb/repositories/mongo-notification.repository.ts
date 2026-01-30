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
    unreadOnly: boolean,
  ): Promise<Notification[]> {
    const docs = await NotificationModel.find({
      userId,
      ...(unreadOnly ? { read: false } : {}),
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return docs.map((doc) => NotificationMapper.toDomain(doc));
  }

  async countNotificationsByUserId(
    userId: string,
    unreadOnly: boolean,
  ): Promise<number> {
    return NotificationModel.countDocuments({
      userId,
      ...(unreadOnly ? { read: false } : {}),
    }).exec();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { read: true } },
    ).exec();
  }
}
