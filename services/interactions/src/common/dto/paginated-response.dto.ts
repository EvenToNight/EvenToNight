export class PaginatedResponseDto<T> {
  items: T[];
  limit: number;
  offset: number;
  hasMore: boolean;
  totalItems: number;

  constructor(items: T[], total: number, limit: number, offset: number) {
    this.items = items;
    this.totalItems = total;
    this.limit = limit;
    this.offset = offset;
    this.hasMore = offset + items.length < total;
  }
}
