import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      // TODO: handle all routing keys
      case "chat.message":
        return this.mapMessage(payload);
      case "interaction.like":
        return this.mapLike(payload);
      case "event.published":
        return this.mapEventCreated(payload);
      default:
        console.warn(`No mapping found for routing key: ${routingKey}`);
        return null;
    }
  }

  private static mapMessage(payload: any): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.receiverId,
      type: "message",
      metadata: {
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        senderName: payload.senderName,
        message: payload.message,
        messageId: payload.messageId,
        senderAvatar: payload.senderAvatar,
      },
    });
  }

  private static mapEventCreated(
    payload: any,
  ): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      type: "new_event",
      metadata: {
        eventId: payload.eventId,
        title: payload.title,
        creatorId: payload.creatorId,
        creatorName: payload.creatorName,
      },
    });
  }
  private static mapLike(payload: any): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.creatorId,
      type: "like",
      metadata: {
        eventId: payload.eventId,
        eventName: payload.eventName,
        userId: payload.userId,
        userName: payload.userName,
      },
    });
  }
}
