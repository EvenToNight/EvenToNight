import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";

export class ExternalEventMapper {
  static mapToCommand(
    routingKey: string,
    payload: any,
  ): CreateNotificationFromEventCommand | null {
    switch (routingKey) {
      // TODO: handle all routing keys
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
}
