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

export type SortOrder = 'asc' | 'desc'
