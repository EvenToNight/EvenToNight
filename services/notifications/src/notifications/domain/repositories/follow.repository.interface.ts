import { Follow } from "../aggregates/follow.aggregate";
import { UserId } from "../value-objects/user-id.vo";

export interface FollowRepository {
  save(follow: Follow): Promise<void>;

  findFollowersByUserId(userId: UserId): Promise<Follow[]>;

  delete(followerId: UserId, followedId: UserId): Promise<void>;
}
