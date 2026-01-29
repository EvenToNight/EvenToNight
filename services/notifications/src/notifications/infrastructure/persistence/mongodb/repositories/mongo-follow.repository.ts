// infrastructure/persistence/mongodb/repositories/mongo-follow.repository.ts
import { FollowRepository } from "../../../../domain/repositories/follow.repository.interface";
import { Follow } from "../../../../domain/aggregates/follow.aggregate";
import { FollowId } from "../../../../domain/value-objects/follow-id.vo";
import { UserId } from "../../../../domain/value-objects/user-id.vo";
import { FollowModel } from "../schemas/follow.schema";
import { FollowMapper } from "../mappers/follow.mapper";

export class MongoFollowRepository implements FollowRepository {
  async save(follow: Follow): Promise<void> {
    const data = FollowMapper.toPersistence(follow);

    try {
      await FollowModel.create(data);
      console.log(
        `✅ Follow saved: ${follow.followerId.toString()} → ${follow.followedId.toString()}`,
      );
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Follow relationship already exists");
      }
      throw error;
    }
  }

  async delete(followerId: UserId, followedId: UserId): Promise<void> {
    const result = await FollowModel.deleteOne({
      followerId: followerId.toString(),
      followedId: followedId.toString(),
    });

    if (result.deletedCount === 0) {
      throw new Error("Follow relationship not found");
    }

    console.log(
      `✅ Follow deleted: ${followerId.toString()} → ${followedId.toString()}`,
    );
  }
}
