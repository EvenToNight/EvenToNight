export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  hasMore: boolean;
}
