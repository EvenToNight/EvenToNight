import type {
  PaginatedRequest,
  PaginatedResponse,
  PaginatedResponseWithTotalCount,
} from '../interfaces/commons'

export const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms))

export const defaultLimit = 20
const defaultOffset = 0

export const emptyPaginatedResponse = <T>(): PaginatedResponseWithTotalCount<T> => ({
  items: [],
  limit: defaultLimit,
  offset: defaultOffset,
  hasMore: false,
  totalItems: 0,
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
    if (value === undefined || value === null) return

    if (value instanceof Set) {
      searchParams.append(key, Array.from(value).join(','))
    } else if (Array.isArray(value)) {
      searchParams.append(key, value.join(','))
    } else if (typeof value === 'object') {
      const values = Object.values(value)
      searchParams.append(key, values.join(','))
    } else {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
