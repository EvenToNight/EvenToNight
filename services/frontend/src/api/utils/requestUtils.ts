import type { PaginatedRequest, PaginatedResponse } from '../interfaces/commons'

export const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms))

export const defaultLimit = 20
const defaultOffset = 0

export const emptyPaginatedResponse = <T>(): PaginatedResponse<T> => ({
  items: [],
  limit: defaultLimit,
  offset: defaultOffset,
  hasMore: false,
})

export const evaluatePagination = (
  pagination?: PaginatedRequest
): { limit: number; offset: number } => {
  const limit = pagination?.limit ?? defaultLimit
  const offset = pagination?.offset ?? defaultOffset
  return { limit, offset }
}

export const getPaginatedItems = <T>(
  collection: T[],
  pagination?: PaginatedRequest
): PaginatedResponse<T> => {
  const { limit, offset } = evaluatePagination(pagination)
  const hasMore = collection.length > offset + limit
  const items = collection.slice(offset, offset + limit)
  return {
    items,
    limit,
    offset,
    hasMore,
  }
}

export const buildQueryParams = <T extends Record<string, any>>(params: T): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
