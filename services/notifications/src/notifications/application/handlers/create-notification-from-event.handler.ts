import { EventPublisher } from "notifications/domain/events/event-publisher.interface";
import { NotificationRepository } from "notifications/domain/repositories/notification.repository.interface";
import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";
import { UserId } from "notifications/domain/value-objects/user-id.vo";
import { NotificationType } from "notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "notifications/domain/value-objects/notification-content.vo";
import { Notification } from "notifications/domain/aggregates/notification.aggregate";
import { NotificationCreatedEvent } from "notifications/domain/events/notification-created.event";

export class CreateNotificationFromEventHandler {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateNotificationFromEventCommand): Promise<string> {
    const userId = UserId.fromString(command.recipientUserId);
    const type = NotificationType.fromString(command.type);
    const content = NotificationContent.create({
      title: command.title,
      message: command.message,
    });

    const notification = Notification.create({
      userId,
      type,
      content,
      read: false,
    });

    // TODO: if type = message, publish message but not save to DB
    await this.repository.save(notification);

    console.log(`Notification created: ${notification.id.toString()}`);

    const domainEvent = new NotificationCreatedEvent(
      notification.id.toString(),
      notification.userId.toString(),
      notification.type.toString(),
      notification.content.toJson(),
      notification.createdAt,
    );

    await this.eventPublisher.publish(domainEvent);

    return notification.id.toString();
  }
}
