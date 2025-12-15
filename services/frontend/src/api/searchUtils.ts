import { api } from '@/api'
import type { Event } from './types/events'
import type { User, UserRole } from './types/users'

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
  const tagsRelevance = Math.max(...event.tags.map((tag) => calculateRelevance(query, tag)), 0)
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
        id: event.id_event,
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
        avatarUrl: user.avatarUrl,
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
    api.users.searchUsers({ name: query }),
  ])

  const results: SearchResult[] = (
    await processEventSearchResults(eventsResponse.items, query)
  ).concat(await processUserSearchResults(usersResponse.items, query))

  const typePriority = { event: 3, organization: 2, member: 1 }
  results.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance
    return typePriority[b.type] - typePriority[a.type]
  })

  return results.slice(0, maxResults)
}
