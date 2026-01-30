import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      case "interactions.like.created":
        return this.mapLike(payload);
      case "interactions.review.created":
        return this.mapReview(payload);
      default:
        console.warn(`No mapping found for routing key: ${routingKey}`);
        return null;
    }
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

  private static mapReview(payload: any): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.creatorId,
      type: "review",
      metadata: {
        eventId: payload.eventId,
        userId: payload.userId,
        userName: payload.userName,
        userAvatar: payload.userAvatar,
      },
    });
  }
}
