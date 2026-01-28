import { NotificationContent } from "../value-objects/notification-content.vo";
import { NotificationId } from "../value-objects/notification-id.vo";
import { NotificationType } from "../value-objects/notification-type.vo";
import { UserId } from "../value-objects/user-id.vo";

export interface NotificationProps {
  userId: UserId;
  type: NotificationType;
  content: NotificationContent;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification {
  private constructor(
    private readonly _id: NotificationId,
    private readonly _userId: UserId,
    private readonly _type: NotificationType,
    private readonly _content: NotificationContent,
    private _read: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static create(props: NotificationProps): Notification {
    return new Notification(
      NotificationId.generate(),
      props.userId,
      props.type,
      props.content,
      props.read,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  static fromPersistence(
    id: NotificationId,
    props: NotificationProps,
  ): Notification {
    return new Notification(
      id,
      props.userId,
      props.type,
      props.content,
      props.read,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  markAsRead(): void {
    this._read = true;
  }

  get id(): NotificationId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get type(): NotificationType {
    return this._type;
  }

  get content(): NotificationContent {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isRead(): boolean {
    return this._read;
  }

  toJSON(): object {
    return {
      id: this._id.toString(),
      userId: this._userId.toString(),
      type: this._type.toString(),
      content: this._content.toJson(),
      read: this._read,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
