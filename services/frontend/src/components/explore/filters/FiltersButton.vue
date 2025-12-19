<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import DateFilters, { type DateFilterValue } from './DateFilters.vue'
import TagFilters from './TagFilters.vue'
import PriceFilters, { type PriceFilterValue } from './PriceFilters.vue'
import SortFilters, { type SortBy } from './SortFilters.vue'
import type { Tag } from '@/api/types/events'
import type { OtherFilter } from './FeedFilters.vue'
import FeedFilters from './FeedFilters.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

export interface EventFilters extends DateFilterValue, PriceFilterValue {
  tags?: Tag[] | null
  sortBy?: SortBy | null
  otherFilter?: OtherFilter | null
}
const initialFilters = inject<EventFilters>('initialEventFilters', {})

const emit = defineEmits<{
  'filters-changed': [filters: EventFilters]
}>()

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

const emitFiltersChanged = () => {
  emit('filters-changed', {
    ...activeDateFilterValue.value,
    ...activePriceFilterValue.value,
    tags: activeTags.value,
    sortBy: activeSortBy.value,
    otherFilter: activeOtherFilter.value,
  })
}

const applyFilters = () => {
  activeDateFilterValue.value = { ...dateFilterValue.value }
  activeTags.value = [...selectedTags.value]
  activePriceFilterValue.value = { ...priceFilterValue.value }
  activeSortBy.value = selectedSortBy.value
  activeOtherFilter.value = selectedOtherFilter.value

  emitFiltersChanged()
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

  emitFiltersChanged()
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

onMounted(() => {
  if (initialFilters && Object.keys(initialFilters).length > 0) {
    // Set draft filters
    if (initialFilters.dateFilter) {
      dateFilterValue.value.dateFilter = initialFilters.dateFilter
    }
    if (initialFilters.dateRange) {
      dateFilterValue.value.dateRange = initialFilters.dateRange
    }
    if (initialFilters.tags) {
      selectedTags.value = initialFilters.tags
    }
    if (initialFilters.priceFilter) {
      priceFilterValue.value.priceFilter = initialFilters.priceFilter
    }
    if (initialFilters.customPriceRange) {
      priceFilterValue.value.customPriceRange = initialFilters.customPriceRange
    }
    if (initialFilters.sortBy) {
      selectedSortBy.value = initialFilters.sortBy
    }
    if (initialFilters.otherFilter) {
      selectedOtherFilter.value = initialFilters.otherFilter
    }

    // Set active filters (same as draft initially)
    if (initialFilters.dateFilter) {
      activeDateFilterValue.value.dateFilter = initialFilters.dateFilter
    }
    if (initialFilters.dateRange) {
      activeDateFilterValue.value.dateRange = initialFilters.dateRange
    }
    if (initialFilters.tags) {
      activeTags.value = initialFilters.tags
    }
    if (initialFilters.priceFilter) {
      activePriceFilterValue.value.priceFilter = initialFilters.priceFilter
    }
    if (initialFilters.customPriceRange) {
      activePriceFilterValue.value.customPriceRange = initialFilters.customPriceRange
    }
    if (initialFilters.sortBy) {
      activeSortBy.value = initialFilters.sortBy
    }
    if (initialFilters.otherFilter) {
      activeOtherFilter.value = initialFilters.otherFilter
    }

    emitFiltersChanged()
  }
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<template>
  <div ref="filtersButtonRef" class="filters-button-wrapper">
    <q-btn outline color="primary" :label="t('filters.filters')" class="outline-btn-fix">
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
              :label="t('filters.cancel')"
              class="clear-filters-btn"
              @click="clearFilters"
            />
            <q-space v-else />
            <q-btn color="primary" :label="t('filters.apply')" @click="applyFilters" />
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
