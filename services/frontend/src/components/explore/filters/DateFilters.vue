<script lang="ts">
export const DATE_FILTERS = ['today', 'this_week', 'this_month'] as const
</script>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'

export type DateFilter = (typeof DATE_FILTERS)[number]

export interface DateFilterValue {
  dateFilter?: DateFilter | null
  dateRange?: { from: Date; to: Date } | null
}

interface Props {
  modelValue?: DateFilterValue
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: DateFilterValue]
}>()

const { locale } = useNavigation()
const { t } = useTranslation('components.explore.filters.DateFilters')

const selectedDateFilter = ref<DateFilter | null>(props.modelValue?.dateFilter || null)
const selectedDateRange = ref<{ from: Date; to: Date } | null>(props.modelValue?.dateRange || null)
const showDateRangePicker = ref(false)
const today = new Date().toISOString().split('T')[0] as string

const dateFilters: { label: string; value: DateFilter }[] = [
  { label: t('today'), value: 'today' },
  { label: t('thisWeek'), value: 'this_week' },
  { label: t('thisMonth'), value: 'this_month' },
]

const emitChange = () => {
  emit('update:modelValue', {
    dateFilter: selectedDateFilter.value,
    dateRange: selectedDateRange.value,
  })
}

const toggleDateFilter = (value: DateFilter) => {
  selectedDateFilter.value = selectedDateFilter.value === value ? null : value
  selectedDateRange.value = null
  emitChange()
}

const formatDateRange = (range: { from: Date; to: Date }) => {
  const from = new Date(range.from)
  const to = new Date(range.to)
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${from.toLocaleDateString(locale.value, options)} - ${to.toLocaleDateString(locale.value, options)}`
}

const applyDateRange = () => {
  if (selectedDateRange.value) {
    selectedDateFilter.value = null
    showDateRangePicker.value = false
    emitChange()
  }
}

const clearDateRange = () => {
  selectedDateRange.value = null
  showDateRangePicker.value = false
  emitChange()
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDateFilter.value = newValue?.dateFilter || null
    selectedDateRange.value = newValue?.dateRange || null
  },
  { deep: true }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('date') }}:</span>
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
              <div class="text-h6">{{ t('selectPeriod') }}</div>
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
                :label="t('cancel')"
                color="grey-7"
                @click="showDateRangePicker = false"
              />
              <q-btn
                v-if="selectedDateRange"
                flat
                :label="t('cancel')"
                color="grey-7"
                @click="clearDateRange"
              />
              <q-btn
                flat
                :label="t('apply')"
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
</template>

<style lang="scss" scoped>
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
</style>
