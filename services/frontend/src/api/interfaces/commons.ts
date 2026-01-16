export interface ApiError {
  message: string
  status: number
}

export interface PaginatedRequest {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  limit: number
  offset: number
  hasMore: boolean
}

export interface PaginatedResponseWithTotalCount<T> extends PaginatedResponse<T> {
  totalItems: number
}

export type ExtendedPaginatedResponse<T, S> = PaginatedResponse<T> & S
export type ExtendedPaginatedResponseWithTotalCount<T, S> = PaginatedResponseWithTotalCount<T> & S

export type SortOrder = 'asc' | 'desc'
