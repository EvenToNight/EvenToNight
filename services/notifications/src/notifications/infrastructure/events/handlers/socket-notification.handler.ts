import { NotificationCreatedEvent } from "../../../domain/events/notification-created.event";
import { SocketIOGateway } from "../../../presentation/gateways/socket-io.gateway";

export class SocketNotificationHandler {
  constructor(private readonly socketGateway: SocketIOGateway) {}

  async handle(event: NotificationCreatedEvent): Promise<void> {
    try {
      console.log(`🔔 Processing socket notification for user ${event.userId}`);

      const isOnline = this.socketGateway.isUserConnected(event.userId);

      if (!isOnline) {
        return;
      }

      const notificationPayload = this.formatNotificationPayload(event);

      await this.socketGateway.sendNotificationToUser(
        event.userId,
        notificationPayload,
      );
      console.log(`✅ Socket notification sent to user ${event.userId}`);
    } catch (error) {
      console.error("Socket emission failed:", error);
    }
  }

  private formatNotificationPayload(event: NotificationCreatedEvent): any {
    return {
      id: event.notificationId,
      type: event.type,
      metadata: event.content,
      read: false,
      createdAt: event.createdAt,
    };
  }
}
