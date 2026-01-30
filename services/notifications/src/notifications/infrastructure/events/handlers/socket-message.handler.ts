import { SocketIOGateway } from "../../../presentation/gateways/socket-io.gateway";
import { MessageReceivedEvent } from "../../../application/handlers/process-message-event.handler";

export class SocketMessageHandler {
  constructor(private readonly socketGateway: SocketIOGateway) {}

  async handle(event: MessageReceivedEvent): Promise<void> {
    try {
      console.log(`💬 Handling message for user ${event.receiverId}`);

      const isOnline = this.socketGateway.isUserConnected(event.receiverId);

      if (!isOnline) {
        console.log(`⚠️  User ${event.receiverId} is offline`);
        return;
      }

      const payload = {
        type: "message",
        metadata: {
          conversationId: event.conversationId,
          senderId: event.senderId,
          senderName: event.senderName,
          message: event.message,
          messageId: event.messageId,
          senderAvatar: event.senderAvatar,
        },
      };

      await this.socketGateway.sendNotificationToUser(
        event.receiverId,
        payload,
      );
      console.log(`✅ Message notification sent to user ${event.receiverId}`);
    } catch (error) {
      console.error(`❌ Failed to send message notification:`, error);
    }
  }
}
