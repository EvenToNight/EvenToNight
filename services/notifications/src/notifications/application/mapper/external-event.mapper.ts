import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      // TODO: handle all routing keys
      case "event.created":
        return this.mapEventCreated(payload);
      case "interaction.like":
        return this.mapInteractionLike(payload);
      default:
        console.warn(`No mapping found for routing key: ${routingKey}`);
        return null;
    }
  }

  private static mapInteractionLike(
    payload: any,
  ): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.targetOwnerId,
      type: "like",
      title: "New Like",
      message: `Your post has a new like`,
      // TODO: metadata ??
    });
  }

  private static mapEventCreated(
    payload: any,
  ): CreateNotificationFromEventCommand {
    return CreateNotificationFromEventCommand.create({
      recipientUserId: payload.organizerId,
      type: "new_event",
      title: "Event Created",
      message: `Organization ${payload.organizerName} has created a new event`,
    });
  }
}
