import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      // TODO: handle all routing keys
      /*case "event.created":
        return this.mapEventCreated(payload);
      */
      case "interaction.like":
        return this.mapLike(payload);
      default:
        console.warn(`No mapping found for routing key: ${routingKey}`);
        return null;
    }
  }
  private static mapEventCreated(
    payload: any,
  ): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.recipientUserId,
      type: "new_event",
      metadata: {
        eventId: payload.eventId,
        title: payload.title,
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
