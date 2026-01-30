import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { GetNotificationsQuery } from "../queries/get-notifications.query";
import { NotificationListDto } from "../dto/notification-list.dto";
import { NotificationDto } from "../dto/notification.dto";

export class GetNotificationsHandler {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(query: GetNotificationsQuery): Promise<NotificationListDto> {
    const notifications = await this.repository.findNotificationsByUserId(
      query.userId,
      query.limit,
      query.offset,
      query.unreadOnly,
    );

    const notificationDtos = notifications.map((notification) =>
      NotificationDto.fromEntity(notification),
    );

    const total = await this.repository.countNotificationsByUserId(
      query.userId,
      query.unreadOnly,
    );

    return NotificationListDto.create(
      notificationDtos,
      total,
      query.limit,
      query.offset,
    );
  }
}
