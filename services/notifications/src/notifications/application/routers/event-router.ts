// application/routers/event-router.ts
import { CreateNotificationFromEventHandler } from "../handlers/create-notification-from-event.handler";
import { ProcessFollowEventHandler } from "../handlers/process-follow-event.handler";
import { ProcessUnfollowEventHandler } from "../handlers/process-unfollow-event.handler";
import { ProcessMessageEventHandler } from "../handlers/process-message-event.handler";
import { ExternalEventMapper } from "../mappers/external-event.mapper";

export class EventRouter {
  constructor(
    private readonly createNotificationHandler: CreateNotificationFromEventHandler,
    private readonly processFollowHandler: ProcessFollowEventHandler,
    private readonly processMessageHandler: ProcessMessageEventHandler,
    private readonly processUnfollowHandler: ProcessUnfollowEventHandler,
  ) {}

  async route(routingKey: string, payload: any): Promise<void> {
    console.log(`🔀 Routing event: ${routingKey}`);

    switch (routingKey) {
      case "interactions.like.created":
      case "interactions.review.created":
      case "event.published":
        await this.handleNotificationOnly(routingKey, payload);
        break;

      case "interactions.follow.created":
        await this.processFollowHandler.execute(payload);
        break;

      case "interactions.follow.deleted":
        await this.processUnfollowHandler.execute(payload);
        break;

      case "chat.message.created":
        await this.processMessageHandler.execute(payload);
        break;

      default:
        console.warn(`⚠️  No handler for routing key: ${routingKey}`);
    }
  }

  private async handleNotificationOnly(
    routingKey: string,
    payload: any,
  ): Promise<void> {
    const command = ExternalEventMapper.mapToCommand(routingKey, payload);

    if (!command) {
      console.warn(`⚠️  No mapper for ${routingKey}`);
      return;
    }

    await this.createNotificationHandler.execute(command);
  }
}
