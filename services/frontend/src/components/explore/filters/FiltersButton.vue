<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import DateFilters, { type DateFilterValue } from './DateFilters.vue'
import TagFilters from './TagFilters.vue'
import PriceFilters, { type PriceFilterValue } from './PriceFilters.vue'
import SortFilters, { type SortBy } from './SortFilters.vue'
import type { Tag } from '@/api/types/events'
import type { OtherFilter } from './FeedFilters.vue'
import FeedFilters from './FeedFilters.vue'
import { useTranslation } from '@/composables/useTranslation'
import { useRoute, useRouter } from 'vue-router'
import { buildExploreFiltersFromQuery, buildExploreRouteQuery } from '@/api/utils/filtersUtils'
import { createLogger } from '@/utils/logger'

const route = useRoute()
const router = useRouter()
const { t } = useTranslation('components.explore.filters.FiltersButton')
const logger = createLogger(import.meta.url)
export interface EventFilters extends DateFilterValue, PriceFilterValue {
  tags?: Tag[] | null
  sortBy?: SortBy | null
  otherFilter?: OtherFilter | null
}

const normalizeQuery = (queryObj: any) => {
  return typeof queryObj === 'object' && queryObj !== null
    ? Object.fromEntries(
        Object.entries(queryObj).map(([k, v]) => [k, Array.isArray(v) ? (v[0] ?? '') : (v ?? '')])
      )
    : {}
}

const filters = defineModel<EventFilters | undefined>('filters')
const isUpdating = ref(false)

watch(
  () => route.query,
  async (newQuery) => {
    if (isUpdating.value) return
    isUpdating.value = true
    const normalized = normalizeQuery(newQuery)
    logger.log('Route query changed:', normalized)
    filters.value = buildExploreFiltersFromQuery(normalized)
    logger.log('Parsed filters from URL:', { ...filters.value })
    await nextTick() // Wait for other watchers to process
    isUpdating.value = false
  },
  { immediate: true }
)

watch(
  filters,
  async (newFilters) => {
    if (isUpdating.value) return
    isUpdating.value = true
    const newQuery = buildExploreRouteQuery(newFilters)
    logger.log('Updating URL with filters:', newQuery)
    router.replace({ query: newQuery })
    await nextTick() // Wait for other watchers to process
    isUpdating.value = false
  },
  { deep: true }
)

const dateFilterValue = ref<DateFilterValue>({})
const selectedTags = ref<Tag[]>([])
const priceFilterValue = ref<PriceFilterValue>({})
const selectedSortBy = ref<SortBy | null>(null)
const selectedOtherFilter = ref<OtherFilter | null>(null)

const countActiveFilters = () => {
  let count = 0
  if (filters.value?.dateFilter) count++
  if (filters.value?.dateRange) count++
  count += filters.value?.tags?.length ?? 0
  if (filters.value?.priceFilter) count++
  if (filters.value?.customPriceRange) count++
  if (filters.value?.sortBy) count++
  if (filters.value?.otherFilter) count++
  return count
}

const filtersButtonRef = ref<HTMLElement | null>(null)
const filtersMenuOpen = ref(false)

const applyFilters = () => {
  // Simply copy draft values to active (watchers already handle mutual exclusion)
  filters.value = {
    ...dateFilterValue.value,
    ...priceFilterValue.value,
    tags: [...selectedTags.value],
    sortBy: selectedSortBy.value,
    otherFilter: selectedOtherFilter.value,
  }
  filtersMenuOpen.value = false
}

const clearFilters = () => {
  dateFilterValue.value = {}
  selectedTags.value = []
  priceFilterValue.value = {}
  selectedSortBy.value = null
  selectedOtherFilter.value = null
  filters.value = {}
}

const hasActiveFilters = computed(
  () =>
    filters.value?.dateFilter ||
    filters.value?.dateRange ||
    (filters.value?.tags && filters.value?.tags.length > 0) ||
    filters.value?.priceFilter ||
    filters.value?.customPriceRange ||
    filters.value?.sortBy ||
    filters.value?.otherFilter
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

watch(filtersMenuOpen, (isOpen) => {
  if (isOpen) {
    dateFilterValue.value = { ...filters.value }
    selectedTags.value = [...(filters.value?.tags || [])]
    priceFilterValue.value = { ...filters.value }
    selectedSortBy.value = filters.value?.sortBy ?? null
    selectedOtherFilter.value = filters.value?.otherFilter ?? null
  }
})

const handleScroll = () => {
  if (filtersMenuOpen.value && isElementHiddenBehindStickyHeader(filtersButtonRef.value)) {
    filtersMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})

//TODO: evaluate combos of otherFilter and regular filters
// Watch for changes in otherFilter - if selected, clear regular filters
// watch(selectedOtherFilter, (newValue) => {
//   if (newValue !== null) {
//     dateFilterValue.value = {}
//     selectedTags.value = []
//     priceFilterValue.value = {}
//   }
// })
// Watch for changes in regular filters - if any is selected, clear otherFilter
// watch(
//   [dateFilterValue, selectedTags, priceFilterValue],
//   () => {
//     const hasRegularFilters =
//       dateFilterValue.value.dateFilter ||
//       dateFilterValue.value.dateRange ||
//       selectedTags.value.length > 0 ||
//       priceFilterValue.value.priceFilter ||
//       priceFilterValue.value.customPriceRange?.min ||
//       priceFilterValue.value.customPriceRange?.max

//     if (hasRegularFilters && selectedOtherFilter.value !== null) {
//       selectedOtherFilter.value = null
//     }
//   },
//   { deep: true }
// )
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
  background-color: $color-primary !important;

  .q-badge__content,
  .q-badge__content *,
  & > div,
  & > span {
    color: white !important;
  }
}

.filter-badge.q-badge.q-badge--floating {
  background-color: $color-primary !important;

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
