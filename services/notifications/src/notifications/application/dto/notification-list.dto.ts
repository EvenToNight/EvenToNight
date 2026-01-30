import { NotificationDto } from "./notification.dto";

export class NotificationListDto {
  constructor(
    public readonly notifications: NotificationDto[],
    public readonly total: number,
    public readonly limit: number,
    public readonly offset: number,
    public readonly hasMore: boolean,
  ) {}

  static create(
    notifications: NotificationDto[],
    total: number,
    limit: number,
    offset: number,
  ): NotificationListDto {
    return new NotificationListDto(
      notifications,
      total,
      limit,
      offset,
      total > offset + limit,
    );
  }

  toJson() {
    return {
      data: this.notifications.map((n) => n.toJson()),
      pagination: {
        total: this.total,
        limit: this.limit,
        offset: this.offset,
        hasMore: this.hasMore,
      },
    };
  }
}
