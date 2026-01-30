import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";

export class MarkAsReadHandler {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async execute(notificationId: string): Promise<void> {
        await this.notificationRepository.markAsRead(notificationId);
    }

}
