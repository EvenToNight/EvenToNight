export class NotificationCreatedEvent {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly content: any,
    public readonly createdAt: Date,
  ) {}
}
