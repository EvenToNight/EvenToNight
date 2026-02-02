<script lang="ts">
export const PRICE_FILTERS = ['free'] as const
</script>
<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
import { ref, computed, watch } from 'vue'
export type PriceFilter = (typeof PRICE_FILTERS)[number]

export interface PriceFilterValue {
  priceFilter?: PriceFilter | null
  customPriceRange?: { min: number; max: number } | null
}

interface Props {
  modelValue?: PriceFilterValue
}

const { t } = useTranslation('components.explore.filters.PriceFilters')

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: PriceFilterValue]
}>()

const PRICE_MIN = 0
const PRICE_MAX = 1000

const isFreeSelected = ref<boolean>(props.modelValue?.priceFilter === 'free')
const priceRange = ref<{ min: number; max: number }>(
  props.modelValue?.customPriceRange || { min: PRICE_MIN, max: PRICE_MAX }
)
const isSliderActive = computed(() => {
  return (
    !isFreeSelected.value && (priceRange.value.min > PRICE_MIN || priceRange.value.max < PRICE_MAX)
  )
})

const emitChange = () => {
  emit('update:modelValue', {
    priceFilter: isFreeSelected.value ? 'free' : null,
    customPriceRange: isSliderActive.value ? priceRange.value : null,
  })
}

const toggleFree = () => {
  isFreeSelected.value = !isFreeSelected.value
  if (isFreeSelected.value) {
    priceRange.value = { min: PRICE_MIN, max: PRICE_MAX }
  }
  emitChange()
}

const onSliderChange = () => {
  if (isFreeSelected.value) {
    isFreeSelected.value = false
  }
  emitChange()
}

const formatPrice = (value: number) => {
  return `€${value}`
}

watch(
  () => props.modelValue,
  (newValue) => {
    isFreeSelected.value = newValue?.priceFilter === 'free'
    priceRange.value = newValue?.customPriceRange || { min: PRICE_MIN, max: PRICE_MAX }
  },
  { deep: true }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('price') }}:</span>
    <div class="price-filter-content">
      <q-chip
        :outline="!isFreeSelected"
        :color="isFreeSelected ? 'primary' : 'grey-3'"
        :text-color="isFreeSelected ? 'white' : 'grey-8'"
        clickable
        @click="toggleFree"
      >
        {{ t('free') }}
      </q-chip>

      <div class="price-slider-container" :class="{ disabled: isFreeSelected }">
        <q-range
          v-model="priceRange"
          :min="PRICE_MIN"
          :max="PRICE_MAX"
          :step="10"
          label
          :left-label-value="`€${priceRange.min}`"
          :right-label-value="`€${priceRange.max}`"
          color="primary"
          snap
          :disable="isFreeSelected"
          @update:model-value="onSliderChange"
        />
        <div class="price-labels">
          <span>{{ formatPrice(PRICE_MIN) }}</span>
          <span>{{ formatPrice(PRICE_MAX) }}</span>
        </div>
      </div>
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

.price-filter-content {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.price-slider-container {
  flex: 1;
  min-width: 150px;
  padding: 0 $spacing-2;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.price-labels {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  margin-top: $spacing-1;
}
</style>
