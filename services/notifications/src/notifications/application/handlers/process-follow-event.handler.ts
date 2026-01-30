import { FollowRepository } from "../../domain/repositories/follow.repository.interface";
import { CreateNotificationFromEventHandler } from "./create-notification-from-event.handler";
import { CreateNotificationFromEventCommand } from "../commands/create-notification-from-event.command";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { Follow } from "../../domain/aggregates/follow.aggregate";

export class ProcessFollowEventHandler {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly createNotificationHandler: CreateNotificationFromEventHandler,
  ) {}

  async execute(payload: any): Promise<void> {
    console.log("👥 Processing follow event");

    const follow = Follow.create({
      followerId: UserId.fromString(payload.followerId),
      followedId: UserId.fromString(payload.followedId),
    });

    await this.followRepository.save(follow);

    console.log(
      `✅ Follow saved: ${payload.followerId} → ${payload.followedId}`,
    );

    const command = CreateNotificationFromEventCommand.create({
      recipientUserId: payload.followedId,
      type: "follow",
      metadata: {
        followerId: payload.followerId,
        followerName: payload.followerName,
        followerAvatar: payload.followerAvatar,
        followId: follow.id.toString(),
      },
    });

    await this.createNotificationHandler.execute(command);

    console.log("✅ Follow notification created");
  }
}
