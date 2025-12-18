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

export type SortOrder = 'asc' | 'desc'
