import { Follow } from "../../../../domain/aggregates/follow.aggregate";
import { FollowId } from "../../../../domain/value-objects/follow-id.vo";
import { UserId } from "../../../../domain/value-objects/user-id.vo";
import { FollowDocument } from "../schemas/follow.schema";

export class FollowMapper {
  static toPersistence(follow: Follow): Partial<FollowDocument> {
    return {
      _id: follow.id.toString(),
      followerId: follow.followerId.toString(),
      followedId: follow.followedId.toString(),
      createdAt: follow.createdAt,
    };
  }

  static toDomain(doc: FollowDocument): Follow {
    return Follow.fromPersistence(FollowId.fromString(doc._id), {
      followerId: UserId.fromString(doc.followerId),
      followedId: UserId.fromString(doc.followedId),
      createdAt: doc.createdAt,
    });
  }
}
