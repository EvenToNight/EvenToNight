import { EventPublisher } from "../../domain/events/event-publisher.interface";
import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { NotificationType } from "../../domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../domain/value-objects/notification-content.vo";
import { Notification } from "../../domain/aggregates/notification.aggregate";
import { NotificationCreatedEvent } from "../../domain/events/notification-created.event";

export class CreateNotificationFromEventHandler {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateNotificationFromEventCommand): Promise<string> {
    const userId = command.recipientUserId
      ? UserId.fromString(command.recipientUserId)
      : undefined;
    const type = NotificationType.fromString(command.type);
    const content = NotificationContent.create(command.metadata);

    if (!userId) {
      return ""; // TODO: if userId is not defined, it's maybe a eventCreated event...
    }

    const notification = Notification.create({
      userId,
      type,
      content,
      read: false,
    });

    const domainEvent = new NotificationCreatedEvent(
      notification.id.toString(),
      notification.userId.toString(),
      notification.type.toString(),
      notification.content.toJson(),
      notification.createdAt,
    );

    if (type.equals(NotificationType.MESSAGE())) {
      await this.eventPublisher.publish(domainEvent);
      console.log(
        `Message notification published: ${notification.id.toString()}`,
      );
      return notification.id.toString();
    }

    await this.repository.save(notification);

    console.log(`Notification created: ${notification.id.toString()}`);

    await this.eventPublisher.publish(domainEvent);

    return notification.id.toString();
  }
}
