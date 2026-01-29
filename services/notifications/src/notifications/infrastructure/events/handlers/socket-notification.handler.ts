import { NotificationCreatedEvent } from "notifications/domain/events/notification-created.event";
import { SocketIOGateway } from "notifications/presentation/gateways/socket-io.gateway";

export class SocketNotificationHandler {
  constructor(private readonly socketGateway: SocketIOGateway) {}

  async handle(event: NotificationCreatedEvent): Promise<void> {
    console.log(`🔔 Sending socket notification to user ${event.userId}`);

    try {
      await this.socketGateway.sendNotificationToUser(event.userId, {
        id: event.notificationId,
        type: event.type,
        content: event.content,
        createdAt: event.createdAt,
      });
    } catch (error) {
      console.error("Socket emission failed:", error);
    }
  }
}
