export class GetNotificationsQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
    public readonly unreadOnly: boolean = false,
  ) {
    if (!userId?.trim()) {
      throw new Error("userId is required");
    }
    if (limit < 1 || limit > 100) {
      throw new Error("limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw new Error("offset cannot be negative");
    }
  }
}
