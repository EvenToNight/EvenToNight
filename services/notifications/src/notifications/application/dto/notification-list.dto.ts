import { NotificationDto } from "./notification.dto";

export class NotificationListDto {
  constructor(
    public readonly notifications: NotificationDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
    public readonly hasMore: boolean,
  ) {}

  static create(
    notifications: NotificationDto[],
    total: number,
    page: number,
    limit: number,
  ): NotificationListDto {
    return new NotificationListDto(
      notifications,
      total,
      page,
      limit,
      total > page * limit,
    );
  }

  toJson() {
    return {
      data: this.notifications.map((n) => n.toJson()),
      pagination: {
        total: this.total,
        page: this.page,
        limit: this.limit,
        hasMore: this.hasMore,
      },
    };
  }
}
