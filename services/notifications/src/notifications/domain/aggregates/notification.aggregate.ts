import { NotificationId } from "../value-objects/notification-id.vo";
import { UserId } from "../value-objects/user-id.vo";

export interface NotificationProps {
  userId: UserId;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification {
  private constructor(
    private readonly id: NotificationId,
    private userId: UserId,
    private read: boolean,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(id: NotificationId, props: NotificationProps): Notification {
    if (!props.createdAt) {
      props.createdAt = new Date();
    }
    if (!props.updatedAt) {
      props.updatedAt = props.createdAt;
    }
    return new Notification(
      id,
      props.userId,
      props.read,
      props.createdAt,
      props.updatedAt,
    );
  }

  getId(): NotificationId {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isRead(): boolean {
    return this.read;
  }

  markAsRead(): void {
    this.read = true;
    this.updatedAt = new Date();
  }
}
