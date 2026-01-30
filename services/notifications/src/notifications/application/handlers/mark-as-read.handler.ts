import { NotificationRepository } from "../../domain/repositories/notification.repository";

export class MarkAsReadHandler {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(notificationId: string): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found`);
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);
  }
}
