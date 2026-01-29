export class GetUnreadCountQuery {
  constructor(public readonly userId: string) {
    if (!userId?.trim()) {
      throw new Error("userId is required");
    }
  }
}
