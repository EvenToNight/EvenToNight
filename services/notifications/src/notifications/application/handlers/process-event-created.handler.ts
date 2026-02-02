import { FollowRepository } from "../../domain/repositories/follow.repository.interface";
import { NotificationRepository } from "../../domain/repositories/notification.repository.interface";
import { EventPublisher } from "../../domain/events/event-publisher.interface";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { NotificationType } from "../../domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../domain/value-objects/notification-content.vo";
import { Notification } from "../../domain/aggregates/notification.aggregate";
import { NotificationCreatedEvent } from "../../domain/events/notification-created.event";

export class ProcessEventCreatedHandler {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(payload: any): Promise<void> {
    console.log("🎉 Processing event created - notifying followers");

    const creatorId = UserId.fromString(payload.creatorId);

    const follows =
      await this.followRepository.findFollowersByUserId(creatorId);

    if (follows.length === 0) {
      console.log("⚠️  Creator has no followers, skipping notifications");
      return;
    }

    console.log(`📢 Notifying ${follows.length} followers`);

    const notificationPromises = follows.map(async (follow) => {
      return this.createNotificationForFollower(follow.followerId, payload);
    });

    await Promise.allSettled(notificationPromises);

    console.log(
      `✅ Event created notifications sent to ${follows.length} followers`,
    );
  }

  private async createNotificationForFollower(
    followerId: UserId,
    payload: any,
  ): Promise<void> {
    try {
      const notification = Notification.create({
        userId: followerId,
        type: NotificationType.fromString("new_event"),
        content: NotificationContent.create({
          creatorId: payload.creatorId,
          eventId: payload.eventId,
          eventName: payload.name,
          creatorName: payload.creatorName,
        }),
        read: false,
      });

      await this.notificationRepository.save(notification);

      const domainEvent = new NotificationCreatedEvent(
        notification.id.toString(),
        notification.userId.toString(),
        notification.type.toString(),
        notification.content.toJson(),
        notification.createdAt,
      );

      await this.eventPublisher.publish(domainEvent);

      console.log(
        `  ✓ Notification created for follower ${followerId.toString()}`,
      );
    } catch (error) {
      console.error(
        `  ✗ Failed to create notification for follower ${followerId.toString()}:`,
        error,
      );
    }
  }
}
