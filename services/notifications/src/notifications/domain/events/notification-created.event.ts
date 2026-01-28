export class NotificationCreatedEvent {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly content: object,
    public readonly createdAt: Date,
  ) {}
}
