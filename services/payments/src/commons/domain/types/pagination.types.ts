export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  items: T[];
  limit: number;
  offset: number;
  hasMore: boolean;
  totalItems: number;
}
