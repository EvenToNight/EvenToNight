import { FollowRepository } from "../../domain/repositories/follow.repository.interface";
import { UserId } from "../../domain/value-objects/user-id.vo";

export class ProcessUnfollowEventHandler {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(payload: any): Promise<void> {
    console.log("👋 Processing unfollow event");

    const followerId = UserId.fromString(payload.followerId);
    const followedId = UserId.fromString(payload.followedId);

    await this.followRepository.delete(followerId, followedId);

    console.log(
      `✅ Unfollow completed: ${payload.followerId} → ${payload.followedId}`,
    );
  }
}
