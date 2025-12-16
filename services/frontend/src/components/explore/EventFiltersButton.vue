<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'
import type { TagCategory } from '@/api/interfaces/events'

export interface EventFilters {
  dateFilter: string | null
  dateRange: { from: string; to: string } | null
  tags: string[]
  priceFilter: string | null
  customPriceRange: { min: number | null; max: number | null }
  sortBy: string | null
}

const emit = defineEmits<{
  'filters-changed': [filters: EventFilters]
}>()

// Filter states
const filtersMenuOpen = ref(false)
const selectedDateFilter = ref<string | null>(null)
const selectedDateRange = ref<{ from: string; to: string } | null>(null)
const selectedTags = ref<string[]>([])
const selectedPriceFilter = ref<string | null>(null)
const customPriceRange = ref<{ min: number | null; max: number | null }>({
  min: null,
  max: null,
})
const tempPriceRange = ref<{ min: number | null; max: number | null }>({ min: null, max: null })
const selectedSortBy = ref<string | null>(null)
const showDateRangePicker = ref(false)
const showPriceRangePicker = ref(false)
const today = new Date().toISOString().split('T')[0] as string

// Filter options
const dateFilters = [
  { label: 'Oggi', value: 'today' },
  { label: 'Questa settimana', value: 'this_week' },
  { label: 'Questo mese', value: 'this_month' },
]

const tagFilters = ref<string[]>([])
const loadTagFilters = async () => {
  try {
    const tagCategories: TagCategory[] = await api.events.getTags()
    tagFilters.value = tagCategories.flatMap((cat) => cat.tags)
  } catch (err) {
    console.error('Failed to load tag filters:', err)
  }
}

const priceFilters = [
  { label: 'Gratis', value: 'free' },
  { label: 'A pagamento', value: 'paid' },
]

const sortByOptions = [
  { label: 'Data crescente', value: 'date_asc' },
  { label: 'Data decrescente', value: 'date_desc' },
  { label: 'Prezzo più basso', value: 'price_asc' },
  { label: 'Prezzo più alto', value: 'price_desc' },
]

// Emit current filters
const emitFiltersChanged = () => {
  emit('filters-changed', {
    dateFilter: selectedDateFilter.value,
    dateRange: selectedDateRange.value,
    tags: selectedTags.value,
    priceFilter: selectedPriceFilter.value,
    customPriceRange: customPriceRange.value,
    sortBy: selectedSortBy.value,
  })
}

// Date filter handlers
const toggleDateFilter = (value: string) => {
  selectedDateFilter.value = selectedDateFilter.value === value ? null : value
  selectedDateRange.value = null
  emitFiltersChanged()
}

const formatDateRange = (range: { from: string; to: string }) => {
  const from = new Date(range.from)
  const to = new Date(range.to)
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${from.toLocaleDateString('it-IT', options)} - ${to.toLocaleDateString('it-IT', options)}`
}

const applyDateRange = () => {
  if (selectedDateRange.value) {
    selectedDateFilter.value = null
    showDateRangePicker.value = false
    emitFiltersChanged()
  }
}

const clearDateRange = () => {
  selectedDateRange.value = null
  showDateRangePicker.value = false
  emitFiltersChanged()
}

// Tag filter handlers
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emitFiltersChanged()
}

// Price filter handlers
const togglePriceFilter = (value: string) => {
  selectedPriceFilter.value = selectedPriceFilter.value === value ? null : value
  customPriceRange.value = { min: null, max: null }
  emitFiltersChanged()
}

const formatPriceRange = (range: { min: number | null; max: number | null }) => {
  if (range.min !== null && range.max !== null) {
    return `€${range.min} - €${range.max}`
  } else if (range.min !== null) {
    return `Da €${range.min}`
  } else if (range.max !== null) {
    return `Fino a €${range.max}`
  }
  return 'Personalizza'
}

const openPriceRangePicker = () => {
  tempPriceRange.value = { ...customPriceRange.value }
}

const applyPriceRange = () => {
  if (tempPriceRange.value.min === null && tempPriceRange.value.max === null) {
    return
  }

  if (tempPriceRange.value.min !== null && tempPriceRange.value.min < 0) {
    tempPriceRange.value.min = 0
  }

  if (tempPriceRange.value.max !== null && tempPriceRange.value.max < 0) {
    tempPriceRange.value.max = 0
  }

  if (
    tempPriceRange.value.min !== null &&
    tempPriceRange.value.max !== null &&
    tempPriceRange.value.min >= tempPriceRange.value.max
  ) {
    return
  }

  customPriceRange.value = { ...tempPriceRange.value }
  selectedPriceFilter.value = null
  showPriceRangePicker.value = false
  emitFiltersChanged()
}

const clearPriceRange = () => {
  tempPriceRange.value = { min: null, max: null }
  customPriceRange.value = { min: null, max: null }
  showPriceRangePicker.value = false
  emitFiltersChanged()
}

const isPriceRangeValid = computed(() => {
  const { min, max } = tempPriceRange.value

  if (min === null && max === null) {
    return false
  }

  if (min !== null && min < 0) {
    return false
  }

  if (max !== null && max < 0) {
    return false
  }

  if (min !== null && max !== null && min >= max) {
    return false
  }

  return true
})

// Sort by handler
const toggleSortBy = (value: string) => {
  selectedSortBy.value = selectedSortBy.value === value ? null : value
  emitFiltersChanged()
}

// Clear all filters
const clearFilters = () => {
  selectedDateFilter.value = null
  selectedDateRange.value = null
  selectedTags.value = []
  selectedPriceFilter.value = null
  customPriceRange.value = { min: null, max: null }
  selectedSortBy.value = null
  emitFiltersChanged()
}

// Computed: has active filters
const hasActiveFilters = computed(
  () =>
    selectedDateFilter.value !== null ||
    selectedDateRange.value !== null ||
    selectedTags.value.length > 0 ||
    selectedPriceFilter.value !== null ||
    customPriceRange.value.min !== null ||
    customPriceRange.value.max !== null ||
    selectedSortBy.value !== null
)

onMounted(() => {
  loadTagFilters()
})
</script>

<template>
  <div class="filters-button-wrapper">
    <q-btn outline color="primary" label="Filtri" class="outline-btn-fix">
      <q-badge
        v-if="hasActiveFilters"
        floating
        class="filter-badge"
        :style="{ color: 'white !important' }"
      >
        {{
          (selectedDateFilter ? 1 : 0) +
          (selectedDateRange ? 1 : 0) +
          selectedTags.length +
          (selectedPriceFilter ? 1 : 0) +
          (customPriceRange.min !== null || customPriceRange.max !== null ? 1 : 0) +
          (selectedSortBy ? 1 : 0)
        }}
      </q-badge>
      <q-menu v-model="filtersMenuOpen">
        <div class="filters-menu">
          <!-- Date Filters -->
          <div class="filter-group">
            <span class="filter-label">Data:</span>
            <div class="filter-chips">
              <q-chip
                v-for="filter in dateFilters"
                :key="filter.value"
                :outline="selectedDateFilter !== filter.value"
                :color="selectedDateFilter === filter.value ? 'primary' : 'grey-3'"
                :text-color="selectedDateFilter === filter.value ? 'white' : 'grey-8'"
                clickable
                @click="toggleDateFilter(filter.value)"
              >
                {{ filter.label }}
              </q-chip>
              <q-chip
                :outline="!selectedDateRange"
                :color="selectedDateRange ? 'primary' : 'grey-3'"
                :text-color="selectedDateRange ? 'white' : 'grey-8'"
                clickable
              >
                {{ selectedDateRange ? formatDateRange(selectedDateRange) : 'Personalizza' }}
                <q-menu v-model="showDateRangePicker" anchor="bottom left" self="top left">
                  <q-card style="min-width: 350px">
                    <q-card-section>
                      <div class="text-h6">Seleziona periodo</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-date
                        v-model="selectedDateRange"
                        range
                        minimal
                        :options="(date) => date >= today"
                      />
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn
                        flat
                        label="Annulla"
                        color="grey-7"
                        @click="showDateRangePicker = false"
                      />
                      <q-btn
                        v-if="selectedDateRange"
                        flat
                        label="Cancella"
                        color="grey-7"
                        @click="clearDateRange"
                      />
                      <q-btn
                        flat
                        label="Applica"
                        color="primary"
                        :disable="!selectedDateRange"
                        @click="applyDateRange"
                      />
                    </q-card-actions>
                  </q-card>
                </q-menu>
              </q-chip>
            </div>
          </div>

          <!-- Tag Filters -->
          <div class="filter-group">
            <span class="filter-label">Categoria:</span>
            <div class="filter-chips">
              <q-chip
                v-for="tag in tagFilters"
                :key="tag"
                :outline="!selectedTags.includes(tag)"
                :color="selectedTags.includes(tag) ? 'primary' : 'grey-3'"
                :text-color="selectedTags.includes(tag) ? 'white' : 'grey-8'"
                clickable
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </q-chip>
            </div>
          </div>

          <!-- Price Filters -->
          <div class="filter-group">
            <span class="filter-label">Prezzo:</span>
            <div class="filter-chips">
              <q-chip
                v-for="filter in priceFilters"
                :key="filter.value"
                :outline="selectedPriceFilter !== filter.value"
                :color="selectedPriceFilter === filter.value ? 'primary' : 'grey-3'"
                :text-color="selectedPriceFilter === filter.value ? 'white' : 'grey-8'"
                clickable
                @click="togglePriceFilter(filter.value)"
              >
                {{ filter.label }}
              </q-chip>
              <q-chip
                :outline="customPriceRange.min === null && customPriceRange.max === null"
                :color="
                  customPriceRange.min !== null || customPriceRange.max !== null
                    ? 'primary'
                    : 'grey-3'
                "
                :text-color="
                  customPriceRange.min !== null || customPriceRange.max !== null
                    ? 'white'
                    : 'grey-8'
                "
                clickable
              >
                {{ formatPriceRange(customPriceRange) }}
                <q-menu
                  v-model="showPriceRangePicker"
                  anchor="bottom left"
                  self="top left"
                  @before-show="openPriceRangePicker"
                >
                  <q-card style="min-width: 320px">
                    <q-card-section>
                      <div class="text-h6">Seleziona range di prezzo</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <div class="price-range-inputs">
                        <q-input
                          v-model.number="tempPriceRange.min"
                          type="number"
                          label="Prezzo minimo"
                          prefix="€"
                          outlined
                          dense
                          :min="0"
                        />
                        <q-input
                          v-model.number="tempPriceRange.max"
                          type="number"
                          label="Prezzo massimo"
                          prefix="€"
                          outlined
                          dense
                          :min="tempPriceRange.min || 0"
                        />
                      </div>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn
                        flat
                        label="Annulla"
                        color="grey-7"
                        @click="showPriceRangePicker = false"
                      />
                      <q-btn
                        v-if="tempPriceRange.min !== null || tempPriceRange.max !== null"
                        flat
                        label="Cancella"
                        color="grey-7"
                        @click="clearPriceRange"
                      />
                      <q-btn
                        flat
                        label="Applica"
                        color="primary"
                        :disable="!isPriceRangeValid"
                        @click="applyPriceRange"
                      />
                    </q-card-actions>
                  </q-card>
                </q-menu>
              </q-chip>
            </div>
          </div>

          <!-- Sort By -->
          <div class="filter-group">
            <span class="filter-label">Ordina per:</span>
            <div class="filter-chips">
              <q-chip
                v-for="option in sortByOptions"
                :key="option.value"
                :outline="selectedSortBy !== option.value"
                :color="selectedSortBy === option.value ? 'primary' : 'grey-3'"
                :text-color="selectedSortBy === option.value ? 'white' : 'grey-8'"
                clickable
                @click="toggleSortBy(option.value)"
              >
                {{ option.label }}
              </q-chip>
            </div>
          </div>

          <!-- Clear Filters Button -->
          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            color="grey-7"
            icon="clear"
            label="Cancella filtri"
            class="clear-filters-btn"
            @click="clearFilters"
          />
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

.filter-group {
  @include flex-column;
  gap: $spacing-2;
}

.filter-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $color-heading;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @include dark-mode {
    color: $color-white;
  }
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: $breakpoint-mobile) {
    flex-wrap: nowrap;
  }
}

.clear-filters-btn {
  align-self: flex-start;
  margin-top: $spacing-2;
}

.price-range-inputs {
  @include flex-column;
  gap: $spacing-3;
}
</style>

<style lang="scss">
// Non-scoped styles for badge text and background color
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

// Force white text on selected filter chips in both light and dark mode
.filters-menu .q-chip.bg-primary {
  .q-chip__content,
  .q-chip__content * {
    color: white !important;
  }
}
</style>
