import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { UnreadCountDTO } from "../dto/unread-count.dto";

export class GetUnreadCountHandler {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<UnreadCountDTO> {
    const count = await this.notificationRepository.countNotificationsByUserId(
      userId,
      true,
    );
    return new UnreadCountDTO(count);
  }
}
