import {
  PaginatedResult,
  PaginationParams,
} from 'src/commons/domain/types/pagination.types';

export class Pagination {
  static readonly DEFAULT_MAX_LIMIT = 100;

  static parse(
    limit?: number,
    offset?: number,
    maxLimit: number = Pagination.DEFAULT_MAX_LIMIT,
  ): PaginationParams {
    if (limit !== undefined && limit < 1) {
      throw new Error('Limit must be >= 1');
    }
    if (offset !== undefined && offset < 0) {
      throw new Error('Offset must be >= 0');
    }

    return {
      limit: Math.min(limit ?? maxLimit, maxLimit),
      offset: offset ?? 0,
    };
  }

  static createResult<T>(
    items: T[],
    totalItems: number,
    params?: PaginationParams,
    maxLimit?: number,
  ): PaginatedResult<T> {
    const parsed = Pagination.parse(params?.limit, params?.offset, maxLimit);

    return {
      items,
      totalItems,
      limit: parsed.limit,
      offset: parsed.offset,
      hasMore: parsed.offset + parsed.limit < totalItems,
    };
  }
}
