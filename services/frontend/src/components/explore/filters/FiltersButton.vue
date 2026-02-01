<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import DateFilters, { type DateFilterValue } from './DateFilters.vue'
import TagFilters from './TagFilters.vue'
import PriceFilters, { type PriceFilterValue } from './PriceFilters.vue'
import SortFilters, { type SortBy } from './SortFilters.vue'
import type { Tag } from '@/api/types/events'
import type { OtherFilter } from './FeedFilters.vue'
import FeedFilters from './FeedFilters.vue'
import { useTranslation } from '@/composables/useTranslation'

const { t } = useTranslation('components.explore.filters.FiltersButton')

// const normalizeQuery = (queryObj: any) => {
//   return typeof queryObj === 'object' && queryObj !== null
//     ? Object.fromEntries(
//         Object.entries(queryObj).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? '') : (v ?? '')])
//       )
//     : {}
// }

// const filters = provide('filtersFromUrl', filtersFromUrl)

// watch(
//   () => route.query,
//   (newQuery) => {
//     const normalized = normalizeQuery(newQuery)
//     const filtersFromQuery = buildExploreFiltersFromQuery(normalized)

//     eventFilters.value = buildExploreRouteQuery(filtersFromQuery)

//     // Update the reactive filters so FiltersButton can sync
//     filtersFromUrl.value = filtersFromQuery

//     searchEvents()
//   },
//   { immediate: true }
// )

export interface EventFilters extends DateFilterValue, PriceFilterValue {
  tags?: Tag[] | null
  sortBy?: SortBy | null
  otherFilter?: OtherFilter | null
}
const filters = defineModel<EventFilters | undefined>('filters')

const dateFilterValue = ref<DateFilterValue>({})
const selectedTags = ref<Tag[]>([])
const priceFilterValue = ref<PriceFilterValue>({})
const selectedSortBy = ref<SortBy | null>(null)
const selectedOtherFilter = ref<OtherFilter | null>(null)

const activeDateFilterValue = ref<DateFilterValue>({})
const activeTags = ref<Tag[]>([])
const activePriceFilterValue = ref<PriceFilterValue>({})
const activeSortBy = ref<SortBy | null>(null)
const activeOtherFilter = ref<OtherFilter | null>(null)

const countActiveFilters = () => {
  let count = 0
  if (activeDateFilterValue.value.dateFilter) count++
  if (activeDateFilterValue.value.dateRange) count++
  count += activeTags.value.length
  if (activePriceFilterValue.value.priceFilter) count++
  if (
    activePriceFilterValue.value.customPriceRange?.min ||
    activePriceFilterValue.value.customPriceRange?.max
  )
    count++
  if (activeSortBy.value) count++
  if (activeOtherFilter.value) count++
  return count
}

const filtersButtonRef = ref<HTMLElement | null>(null)
const filtersMenuOpen = ref(false)

// const emitFiltersChanged = () => {
//   emit('filters-changed', {
//     ...activeDateFilterValue.value,
//     ...activePriceFilterValue.value,
//     tags: activeTags.value,
//     sortBy: activeSortBy.value,
//     otherFilter: activeOtherFilter.value,
//   })
// }

const applyFilters = () => {
  // Simply copy draft values to active (watchers already handle mutual exclusion)
  activeDateFilterValue.value = { ...dateFilterValue.value }
  activeTags.value = [...selectedTags.value]
  activePriceFilterValue.value = { ...priceFilterValue.value }
  activeSortBy.value = selectedSortBy.value
  activeOtherFilter.value = selectedOtherFilter.value

  // emitFiltersChanged()
  filtersMenuOpen.value = false
}

const clearFilters = () => {
  dateFilterValue.value = {}
  selectedTags.value = []
  priceFilterValue.value = {}
  selectedSortBy.value = null
  selectedOtherFilter.value = null

  activeDateFilterValue.value = {}
  activeTags.value = []
  activePriceFilterValue.value = {}
  activeSortBy.value = null
  activeOtherFilter.value = null

  // emitFiltersChanged()
}

const hasActiveFilters = computed(
  () =>
    activeDateFilterValue.value.dateFilter ||
    activeDateFilterValue.value.dateRange ||
    activeTags.value.length > 0 ||
    activePriceFilterValue.value.priceFilter ||
    activePriceFilterValue.value.customPriceRange?.min ||
    activePriceFilterValue.value.customPriceRange?.max ||
    activeSortBy.value ||
    activeOtherFilter.value
)

const isElementHiddenBehindStickyHeader = (el: HTMLElement | null) => {
  if (!el) return true
  const rect = el.getBoundingClientRect()
  const stickyHeader = document.querySelector('.explore-tab-header')
  if (!stickyHeader) return false
  const headerRect = stickyHeader.getBoundingClientRect()
  const stickyHeaderHeight = headerRect.bottom
  return rect.top < stickyHeaderHeight
}

const handleScroll = () => {
  if (filtersMenuOpen.value && isElementHiddenBehindStickyHeader(filtersButtonRef.value)) {
    filtersMenuOpen.value = false
  }
}

watch(filtersMenuOpen, (isOpen) => {
  if (isOpen) {
    dateFilterValue.value = { ...activeDateFilterValue.value }
    selectedTags.value = [...activeTags.value]
    priceFilterValue.value = { ...activePriceFilterValue.value }
    selectedSortBy.value = activeSortBy.value
    selectedOtherFilter.value = activeOtherFilter.value
  }
})

const syncFiltersFromUrl = (filters: EventFilters) => {
  // Set draft filters
  dateFilterValue.value = {
    dateFilter: filters?.dateFilter ?? null,
    dateRange: filters?.dateRange ?? null,
  }
  selectedTags.value = (filters?.tags as Tag[]) || []
  priceFilterValue.value = {
    priceFilter: filters?.priceFilter ?? null,
    customPriceRange: filters?.customPriceRange || { min: null, max: null },
  }
  selectedSortBy.value = filters?.sortBy ?? null
  selectedOtherFilter.value = filters?.otherFilter ?? null

  // Set active filters (same as draft)
  activeDateFilterValue.value = {
    dateFilter: filters?.dateFilter ?? null,
    dateRange: filters?.dateRange ?? null,
  }
  activeTags.value = (filters?.tags as Tag[]) || []
  activePriceFilterValue.value = {
    priceFilter: filters?.priceFilter ?? null,
    customPriceRange: filters?.customPriceRange || { min: null, max: null },
  }
  activeSortBy.value = filters?.sortBy ?? null
  activeOtherFilter.value = filters?.otherFilter ?? null
}

// Watch for URL changes
watch(
  filters,
  (newFilters) => {
    // Sync even if empty (to clear filters when URL is cleared)
    syncFiltersFromUrl(newFilters || {})
  },
  { deep: true, immediate: true }
)

// Watch for changes in regular filters - if any is selected, clear otherFilter
watch(
  [dateFilterValue, selectedTags, priceFilterValue],
  () => {
    const hasRegularFilters =
      dateFilterValue.value.dateFilter ||
      dateFilterValue.value.dateRange ||
      selectedTags.value.length > 0 ||
      priceFilterValue.value.priceFilter ||
      priceFilterValue.value.customPriceRange?.min ||
      priceFilterValue.value.customPriceRange?.max

    if (hasRegularFilters && selectedOtherFilter.value !== null) {
      selectedOtherFilter.value = null
    }
  },
  { deep: true }
)

// Watch for changes in otherFilter - if selected, clear regular filters
watch(selectedOtherFilter, (newValue) => {
  if (newValue !== null) {
    // Clear all regular filters
    dateFilterValue.value = {}
    selectedTags.value = []
    priceFilterValue.value = {}
  }
})

onMounted(() => {
  // // Always sync with initial filters (even if empty)
  // syncFiltersFromUrl(initialFilters || {})

  // // Only emit if there are actual filters to apply
  // if (initialFilters && Object.keys(initialFilters).length > 0) {
  //   emitFiltersChanged()
  // }

  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div ref="filtersButtonRef" class="filters-button-wrapper">
    <q-btn outline color="primary" :label="t('filters')" class="outline-btn-fix">
      <q-badge
        v-if="hasActiveFilters"
        floating
        class="filter-badge"
        :style="{ color: 'white !important' }"
      >
        {{ countActiveFilters() }}
      </q-badge>
      <q-menu v-model="filtersMenuOpen">
        <div class="filters-menu">
          <DateFilters v-model="dateFilterValue" />
          <TagFilters v-model="selectedTags" />
          <PriceFilters v-model="priceFilterValue" />
          <SortFilters v-model="selectedSortBy" />
          <FeedFilters v-model="selectedOtherFilter" />
          <div class="action-buttons">
            <q-btn
              v-if="hasActiveFilters"
              flat
              dense
              color="grey-7"
              :label="t('cancel')"
              class="clear-filters-btn"
              @click="clearFilters"
            />
            <q-space v-else />
            <q-btn color="primary" :label="t('apply')" @click="applyFilters" />
          </div>
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<style lang="scss" scoped>
.filters-button-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-bottom: $spacing-4;
}

.filters-menu {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-4;
  min-width: 320px;
  max-width: 400px;

  @media (max-width: $breakpoint-mobile) {
    min-width: 280px;
    max-width: 90vw;
  }
}

.clear-filters-btn {
  align-self: flex-start;
  margin-top: $spacing-2;
}

.action-buttons {
  @include flex-between;
}
</style>

<style lang="scss">
.filter-badge.q-badge {
  background-color: #6f00ff !important;

  .q-badge__content,
  .q-badge__content *,
  & > div,
  & > span {
    color: white !important;
  }
}

.filter-badge.q-badge.q-badge--floating {
  background-color: #6f00ff !important;

  .q-badge__content,
  .q-badge__content *,
  & > div,
  & > span {
    color: white !important;
  }
}

.filters-menu .q-chip.bg-primary {
  .q-chip__content,
  .q-chip__content * {
    color: white !important;
  }
}
</style>
