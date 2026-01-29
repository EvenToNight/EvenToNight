import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      // TODO: handle all routing keys
      case "chat.message.created":
        return this.mapMessage(payload);
      case "interaction.like.created":
        return this.mapLike(payload);
      case "interaction.follow.created":
        return this.mapFollow(payload);
      case "event.published":
        return this.mapEventCreated(payload);
      default:
        console.warn(`No mapping found for routing key: ${routingKey}`);
        return null;
    }
  }

  private static mapMessage(payload: any): CreateNotificationFromEventCommand {
    console.log("Mapping chat.message.created event payload:", payload);
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
        userAvatar: payload.userAvatar,
      },
    });
  }

  private static mapFollow(payload: any): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.followedId,
      type: "follow",
      metadata: {
        followerId: payload.followerId,
        followerName: payload.followerName,
        followerAvatar: payload.followerAvatar,
      },
    });
  }
}
