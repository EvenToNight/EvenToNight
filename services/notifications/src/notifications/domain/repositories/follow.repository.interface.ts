import { Follow } from "../aggregates/follow.aggregate";
import { UserId } from "../value-objects/user-id.vo";

export interface FollowRepository {
  save(follow: Follow): Promise<void>;

  delete(followerId: UserId, followedId: UserId): Promise<void>;
}
