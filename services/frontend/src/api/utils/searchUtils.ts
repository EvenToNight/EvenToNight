import { api } from '@/api'
import type { Event, Tag } from '../types/events'
import type { User, UserRole } from '../types/users'
import type { EventFilters } from '@/components/explore/filters/FiltersButton.vue'
import type { EventsQueryParams } from '../interfaces/events'
import type { SortBy } from '@/components/explore/filters/SortFilters.vue'
import type { DateFilter } from '@/components/explore/filters/DateFilters.vue'
import type { PriceFilter } from '@/components/explore/filters/PriceFilters.vue'

export interface SearchResultBase {
  type: 'event' | UserRole
  id: string
  relevance: number
}

export interface SearchResultEvent extends SearchResultBase {
  type: 'event'
  title: string
  location: string
  date: Date
  imageUrl?: string
}

export interface SearchResultUser extends SearchResultBase {
  type: UserRole
  name: string
  avatarUrl?: string
}

export type SearchResult = SearchResultEvent | SearchResultUser

const calculateRelevance = (query: string, targetText: string): number => {
  const lowerQuery = query.toLowerCase().trim()
  const lowerTargetText = targetText.toLowerCase()

  if (!lowerQuery || !lowerTargetText) return 0
  if (lowerTargetText === lowerQuery) return 100
  if (lowerTargetText.startsWith(lowerQuery)) return 80
  const splittedLowerTargetText = lowerTargetText.split(/\s+/)
  if (splittedLowerTargetText.some((word) => word.startsWith(lowerQuery))) return 60
  if (lowerTargetText.includes(lowerQuery)) return 40
  const lowerQueryNoSpaces = lowerQuery.replace(/\s+/g, '')
  const lowerTargetTextNoSpaces = lowerTargetText.replace(/\s+/g, '')
  if (lowerTargetTextNoSpaces.includes(lowerQueryNoSpaces)) return 20
  return 0
}

const calculateEventResultRelevance = async (event: Event, query: string): Promise<number> => {
  const titleRelevance = calculateRelevance(query, event.title)
  const locationRelevance = Math.max(
    calculateRelevance(query, event.location.name || ''),
    calculateRelevance(query, event.location.city)
  )
  const tagsRelevance = Math.max(
    ...(event.tags?.map((tag) => calculateRelevance(query, tag)) || []),
    0
  )
  return Math.max(titleRelevance * 100, locationRelevance * 50, tagsRelevance * 50)
}

const processEventSearchResults = async (
  events: Event[],
  query: string
): Promise<SearchResult[]> => {
  const resultPromises = events.map(async (event): Promise<SearchResultEvent | null> => {
    const relevance = await calculateEventResultRelevance(event, query)
    if (relevance > 0) {
      return {
        type: 'event',
        id: event.eventId,
        title: event.title,
        location: event.location.name || event.location.city,
        date: new Date(event.date),
        imageUrl: event.poster,
        relevance: relevance,
      }
    }
    return null
  })
  const results = await Promise.all(resultPromises)
  return results.filter((result) => result !== null)
}

const calculateUserResultRelevance = async (user: User, query: string): Promise<number> => {
  return calculateRelevance(query, user.name) * 100
}

const processUserSearchResults = async (users: User[], query: string): Promise<SearchResult[]> => {
  const resultPromises = users.map(async (user): Promise<SearchResultUser | null> => {
    const relevance = await calculateUserResultRelevance(user, query)
    if (relevance > 0) {
      return {
        type: user.role,
        id: user.id,
        name: user.name,
        avatarUrl: user.avatar,
        relevance: relevance,
      }
    }
    return null
  })
  const results = await Promise.all(resultPromises)
  return results.filter((result) => result !== null)
}

export const getSearchResult = async (
  query: string,
  maxResults: number
): Promise<SearchResult[]> => {
  const [eventsResponse, usersResponse] = await Promise.all([
    api.events.searchEvents({ title: query }),
    api.users.searchUsers({ prefix: query }),
  ])
  const processedEvents = await processEventSearchResults(eventsResponse.items, query)
  const processedUsers = await processUserSearchResults(usersResponse.items, query)
  const results: SearchResult[] = processedEvents.concat(processedUsers)

  const typePriority = { event: 3, organization: 2, member: 1 }
  results.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance
    return typePriority[b.type] - typePriority[a.type]
  })

  return results.slice(0, maxResults)
}

const convertSortBy = (
  eventsQueryParams: EventsQueryParams,
  sortBy: SortBy | undefined | null
): void => {
  if (sortBy) {
    switch (sortBy) {
      case 'date_asc':
        eventsQueryParams.sortBy = 'date'
        eventsQueryParams.sortOrder = 'asc'
        break
      case 'date_desc':
        eventsQueryParams.sortBy = 'date'
        eventsQueryParams.sortOrder = 'desc'
        break
      case 'price_asc':
        eventsQueryParams.sortBy = 'price'
        eventsQueryParams.sortOrder = 'asc'
        break
      case 'price_desc':
        eventsQueryParams.sortBy = 'price'
        eventsQueryParams.sortOrder = 'desc'
        break
    }
  }
}

const convertDateFilter = (
  eventsQueryParams: EventsQueryParams,
  dateFilter: DateFilter | undefined | null
): void => {
  if (dateFilter) {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'this_week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - now.getDay())
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
    }

    eventsQueryParams.startDate = startDate!.toISOString().replace(/\.\d{3}Z$/, '')
    eventsQueryParams.endDate = endDate!.toISOString().replace(/\.\d{3}Z$/, '')
  }
}

const convertDateRange = (
  eventsQueryParams: EventsQueryParams,
  dateRange: { from: Date; to: Date } | undefined | null
): void => {
  if (dateRange) {
    eventsQueryParams.startDate = dateRange.from.toISOString().replace(/\.\d{3}Z$/, '')
    eventsQueryParams.endDate = dateRange.to.toISOString().replace(/\.\d{3}Z$/, '')
  }
}

const convertTags = (
  eventsQueryParams: EventsQueryParams,
  tags: Tag[] | undefined | null
): void => {
  if (tags && tags.length > 0) {
    eventsQueryParams.tags = tags
  }
}

const convertCustomPriceRange = (
  eventsQueryParams: EventsQueryParams,
  customPriceRange: { min?: number | null; max?: number | null } | undefined | null
): void => {
  if (customPriceRange) {
    if (customPriceRange.min !== null && customPriceRange.min !== undefined) {
      eventsQueryParams.priceMin = customPriceRange.min
    }
    if (customPriceRange.max !== null && customPriceRange.max !== undefined) {
      eventsQueryParams.priceMax = customPriceRange.max
    }
  }
}

const convertPriceFilter = (
  eventsQueryParams: EventsQueryParams,
  priceFilter: PriceFilter | undefined | null
): void => {
  if (priceFilter === 'free') {
    eventsQueryParams.priceMin = 0
    eventsQueryParams.priceMax = 0
  } else if (priceFilter === 'paid') {
    eventsQueryParams.priceMin = 0.01
  }
}

export const convertFiltersToEventsQueryParams = (filters: EventFilters): EventsQueryParams => {
  const { sortBy, dateRange, customPriceRange, dateFilter, priceFilter, tags } = filters
  const eventsQueryParams: EventsQueryParams = {}
  convertSortBy(eventsQueryParams, sortBy)
  convertDateFilter(eventsQueryParams, dateFilter)
  convertDateRange(eventsQueryParams, dateRange)
  convertTags(eventsQueryParams, tags)
  convertCustomPriceRange(eventsQueryParams, customPriceRange)
  convertPriceFilter(eventsQueryParams, priceFilter)
  return eventsQueryParams
}
