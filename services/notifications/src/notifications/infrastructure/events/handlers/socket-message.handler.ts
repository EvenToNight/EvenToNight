import { SocketIOGateway } from "../../../presentation/gateways/socket-io.gateway";
import { MessageReceivedEvent } from "../../../application/handlers/process-message-event.handler";

export class SocketMessageHandler {
  constructor(private readonly socketGateway: SocketIOGateway) {}

  async handle(event: MessageReceivedEvent): Promise<void> {
    try {
      console.log(
        `💬 Handling message for users: receiver=${event.receiverId}, sender=${event.senderId}`,
      );

      const payload = {
        type: "message",
        metadata: {
          conversationId: event.conversationId,
          senderId: event.senderId,
          senderName: event.senderName,
          message: event.message,
          messageId: event.messageId,
          senderAvatar: event.senderAvatar,
          createdAt: event.createdAt,
        },
      };

      const receiverOnline = this.socketGateway.isUserConnected(
        event.receiverId,
      );
      if (receiverOnline) {
        await this.socketGateway.sendNotificationToUser(
          event.receiverId,
          payload,
        );
        console.log(`✅ Message sent to receiver ${event.receiverId}`);
      } else {
        console.log(`⚠️  Receiver ${event.receiverId} is offline`);
      }

      const senderOnline = this.socketGateway.isUserConnected(event.senderId);
      if (senderOnline) {
        await this.socketGateway.sendNotificationToUser(
          event.senderId,
          payload,
        );
        console.log(`✅ Message sent to sender ${event.senderId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send message notification:`, error);
    }
  }
}
