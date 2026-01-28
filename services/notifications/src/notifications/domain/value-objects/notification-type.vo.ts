export enum NotificationTypeEnum {
  MESSAGE = "message",
  LIKE = "like",
  FOLLOW = "follow",
  REVIEW = "review",
  NEW_EVENT = "new_event",
  TICKET_SELL = "ticket_sell",
  TICKET_BUY = "ticket_buy",
}

export class NotificationType {
  private constructor(private readonly value: NotificationTypeEnum) {}

  static fromString(type: string): NotificationType {
    const upperType = type.toUpperCase();
    if (!Object.keys(NotificationTypeEnum).includes(upperType)) {
      throw new Error(`Invalid notification type: ${type}`);
    }
    return new NotificationType(
      NotificationTypeEnum[upperType as keyof typeof NotificationTypeEnum],
    );
  }

  static MESSAGE(): NotificationType {
    return new NotificationType(NotificationTypeEnum.MESSAGE);
  }

  static LIKE(): NotificationType {
    return new NotificationType(NotificationTypeEnum.LIKE);
  }

  static FOLLOW(): NotificationType {
    return new NotificationType(NotificationTypeEnum.FOLLOW);
  }

  static REVIEW(): NotificationType {
    return new NotificationType(NotificationTypeEnum.REVIEW);
  }

  static NEW_EVENT(): NotificationType {
    return new NotificationType(NotificationTypeEnum.NEW_EVENT);
  }

  static TICKET_SELL(): NotificationType {
    return new NotificationType(NotificationTypeEnum.TICKET_SELL);
  }

  static TICKET_BUY(): NotificationType {
    return new NotificationType(NotificationTypeEnum.TICKET_BUY);
  }

  toString(): string {
    return this.value;
  }

  equals(other: NotificationType): boolean {
    return this.value === other.value;
  }
}
