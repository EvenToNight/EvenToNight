<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
export type PriceFilter = 'free' | 'paid'

export interface PriceFilterValue {
  priceFilter?: PriceFilter | null
  customPriceRange?: { min?: number | null; max?: number | null }
}

interface Props {
  modelValue?: PriceFilterValue
}

const { t } = useI18n()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: PriceFilterValue]
}>()

const selectedPriceFilter = ref<PriceFilter | null>(props.modelValue?.priceFilter || null)
const priceFilters: { label: string; value: PriceFilter }[] = [
  { label: t('filters.priceFilters.free'), value: 'free' },
  { label: t('filters.priceFilters.paid'), value: 'paid' },
]

const customPriceRange = ref<{ min?: number | null; max?: number | null }>(
  props.modelValue?.customPriceRange || { min: null, max: null }
)
const tempPriceRange = ref<{ min?: number | null; max?: number | null }>({ min: null, max: null })
const showPriceRangePicker = ref(false)

const emitChange = () => {
  emit('update:modelValue', {
    priceFilter: selectedPriceFilter.value,
    customPriceRange: customPriceRange.value,
  })
}

const togglePriceFilter = (value: PriceFilter) => {
  selectedPriceFilter.value = selectedPriceFilter.value === value ? null : value
  customPriceRange.value = { min: null, max: null }
  emitChange()
}

const formatPriceRange = (range: { min?: number | null; max?: number | null }) => {
  if (range.min && range.max) {
    return `€${range.min} - €${range.max}`
  } else if (range.min) {
    return `${t('filters.priceFilters.from')} €${range.min}`
  } else if (range.max) {
    return `${t('filters.priceFilters.to')} €${range.max}`
  }
  return t('filters.priceFilters.customize')
}

const applyPriceRange = () => {
  customPriceRange.value = { ...tempPriceRange.value }
  selectedPriceFilter.value = null
  showPriceRangePicker.value = false
  emitChange()
}

const clearPriceRange = () => {
  tempPriceRange.value = { min: null, max: null }
  customPriceRange.value = { min: null, max: null }
  showPriceRangePicker.value = false
  emitChange()
}

const isPriceRangeValid = computed(() => {
  const { min, max } = tempPriceRange.value
  if (min == null && max == null) return false
  if (min != null && min < 0) return false
  if (max != null && max < 0) return false
  if (min != null && max != null && min > max) return false
  return true
})

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPriceFilter.value = newValue?.priceFilter || null
    customPriceRange.value = newValue?.customPriceRange || { min: null, max: null }
  },
  { deep: true }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('filters.priceFilters.price') }}:</span>
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
          customPriceRange.min !== null || customPriceRange.max !== null ? 'primary' : 'grey-3'
        "
        :text-color="
          customPriceRange.min !== null || customPriceRange.max !== null ? 'white' : 'grey-8'
        "
        clickable
      >
        {{ formatPriceRange(customPriceRange) }}
        <q-menu
          v-model="showPriceRangePicker"
          anchor="bottom left"
          self="top left"
          @before-show="tempPriceRange = { ...customPriceRange }"
        >
          <q-card style="min-width: 320px">
            <q-card-section>
              <div class="text-h6">{{ t('filters.priceFilters.selectPrice') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="price-range-inputs">
                <q-input
                  v-model.number="tempPriceRange.min"
                  type="number"
                  :label="t('filters.priceFilters.minPrice')"
                  prefix="€"
                  outlined
                  dense
                  :min="0"
                />
                <q-input
                  v-model.number="tempPriceRange.max"
                  type="number"
                  :label="t('filters.priceFilters.maxPrice')"
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
                :label="t('filters.cancel')"
                color="grey-7"
                @click="showPriceRangePicker = false"
              />
              <q-btn
                v-if="tempPriceRange.min !== null || tempPriceRange.max !== null"
                flat
                :label="t('filters.priceFilters.clear')"
                color="grey-7"
                @click="clearPriceRange"
              />
              <q-btn
                flat
                :label="t('filters.priceFilters.apply')"
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

.price-range-inputs {
  @include flex-column;
  gap: $spacing-3;
}
</style>
