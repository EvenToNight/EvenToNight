import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";

export class MarkAllAsReadHandler {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsReadByUserId(userId);
  }
}
