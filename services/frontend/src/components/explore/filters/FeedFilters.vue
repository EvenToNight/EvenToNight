<script lang="ts">
export const FEED_FILTERS = ['upcoming', 'popular', 'for_you', 'new', 'nearby'] as const
</script>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export type OtherFilter = (typeof FEED_FILTERS)[number]

interface Props {
  modelValue?: OtherFilter | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: OtherFilter | null]
}>()

const { t } = useI18n()
const selectedOtherFilter = ref<OtherFilter | null>(props.modelValue || null)

const otherFilters: { label: string; value: OtherFilter }[] = [
  { label: t('filters.feedFilters.upcoming'), value: 'upcoming' },
  { label: t('filters.feedFilters.popular'), value: 'popular' },
  { label: t('filters.feedFilters.forYou'), value: 'for_you' },
  { label: t('filters.feedFilters.new'), value: 'new' },
  { label: t('filters.feedFilters.nearby'), value: 'nearby' },
]

const toggleOtherFilter = (value: OtherFilter) => {
  selectedOtherFilter.value = selectedOtherFilter.value === value ? null : value
  emit('update:modelValue', selectedOtherFilter.value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedOtherFilter.value = newValue || null
  }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('filters.feedFilters.others') }}:</span>
    <div class="filter-chips">
      <q-chip
        v-for="filter in otherFilters"
        :key="filter.value"
        :outline="selectedOtherFilter !== filter.value"
        :color="selectedOtherFilter === filter.value ? 'primary' : 'grey-3'"
        :text-color="selectedOtherFilter === filter.value ? 'white' : 'grey-8'"
        clickable
        @click="toggleOtherFilter(filter.value)"
      >
        {{ filter.label }}
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
