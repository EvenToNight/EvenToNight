import { FollowId } from "../value-objects/follow-id.vo";
import { UserId } from "../value-objects/user-id.vo";

export interface FollowProps {
  followerId: UserId;
  followedId: UserId;
  createdAt?: Date;
}

export class Follow {
  private constructor(
    private readonly _id: FollowId,
    private readonly _followerId: UserId,
    private readonly _followedId: UserId,
    private readonly _createdAt: Date,
  ) {
    this.validate();
  }

  static create(props: FollowProps): Follow {
    return new Follow(
      FollowId.generate(),
      props.followerId,
      props.followedId,
      props.createdAt ?? new Date(),
    );
  }

  static fromPersistence(id: FollowId, props: FollowProps): Follow {
    return new Follow(
      id,
      props.followerId,
      props.followedId,
      props.createdAt ?? new Date(),
    );
  }

  private validate(): void {
    if (this._followerId.equals(this._followedId)) {
      throw new Error("User cannot follow themselves");
    }
  }

  get id(): FollowId {
    return this._id;
  }

  get followerId(): UserId {
    return this._followerId;
  }

  get followedId(): UserId {
    return this._followedId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON(): object {
    return {
      id: this._id.toString(),
      followerId: this._followerId.toString(),
      followedId: this._followedId.toString(),
      createdAt: this._createdAt,
    };
  }
}
