import { DATE_FILTERS, type DateFilter } from '@/components/explore/filters/DateFilters.vue'
import { FEED_FILTERS, type OtherFilter } from '@/components/explore/filters/FeedFilters.vue'
import type { EventFilters } from '@/components/explore/filters/FiltersButton.vue'
import { PRICE_FILTERS, type PriceFilter } from '@/components/explore/filters/PriceFilters.vue'
import { SORT_BY_OPTIONS, type SortBy } from '@/components/explore/filters/SortFilters.vue'

export const buildExploreRouteQuery = (initialFilter?: EventFilters): Record<string, string> => {
  const queryParams: Record<string, string> = {}
  if (initialFilter) {
    if (initialFilter.dateFilter) {
      queryParams.dateFilter = initialFilter.dateFilter
    }
    if (initialFilter.dateRange) {
      queryParams.dateFrom = initialFilter.dateRange.from.toISOString()
      queryParams.dateTo = initialFilter.dateRange.to.toISOString()
    }
    if (initialFilter.priceFilter) {
      queryParams.priceFilter = initialFilter.priceFilter
    }
    if (initialFilter.customPriceRange) {
      if (
        initialFilter.customPriceRange.min !== undefined &&
        initialFilter.customPriceRange.min !== null
      ) {
        queryParams.priceMin = String(initialFilter.customPriceRange.min)
      }
      if (
        initialFilter.customPriceRange.max !== undefined &&
        initialFilter.customPriceRange.max !== null
      ) {
        queryParams.priceMax = String(initialFilter.customPriceRange.max)
      }
    }
    if (initialFilter.tags && initialFilter.tags.length > 0) {
      const tagsString = initialFilter.tags.join(',')
      if (tagsString) {
        queryParams.tags = tagsString
      }
    }
    if (initialFilter.sortBy) {
      queryParams.sortBy = initialFilter.sortBy
    }
    if (initialFilter.otherFilter) {
      queryParams.otherFilter = String(initialFilter.otherFilter)
    }
  }
  return queryParams
}

export const buildExploreFiltersFromQuery = (query: Record<string, string>): EventFilters => {
  const filters: EventFilters = {}
  if (query.dateFilter) {
    filters.dateFilter = DATE_FILTERS.includes(query.dateFilter as DateFilter)
      ? (query.dateFilter as DateFilter)
      : undefined
  }
  if (query.dateFrom && query.dateTo) {
    filters.dateRange = {
      from: new Date(query.dateFrom),
      to: new Date(query.dateTo),
    }
  }
  if (query.priceFilter) {
    filters.priceFilter = PRICE_FILTERS.includes(query.priceFilter as PriceFilter)
      ? (query.priceFilter as PriceFilter)
      : undefined
  }
  if (query.priceMin || query.priceMax) {
    filters.customPriceRange = {
      min: query.priceMin ? parseFloat(query.priceMin) : 0,
      max: query.priceMax ? parseFloat(query.priceMax) : 1000,
    }
  }
  //TODO tags type
  if (query.tags) {
    filters.tags = query.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0) as any
  }
  if (query.sortBy) {
    filters.sortBy = SORT_BY_OPTIONS.includes(query.sortBy as SortBy)
      ? (query.sortBy as SortBy)
      : undefined
  }
  if (query.otherFilter) {
    filters.otherFilter = FEED_FILTERS.includes(query.otherFilter as OtherFilter)
      ? (query.otherFilter as OtherFilter)
      : undefined
  }
  return filters
}
