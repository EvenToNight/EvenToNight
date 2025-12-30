<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export type SortBy = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc'

interface Props {
  modelValue?: SortBy | null
}

const { t } = useI18n()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SortBy | null]
}>()

const selectedSortBy = ref<SortBy | null>(props.modelValue || null)

const sortByOptions: { label: string; value: SortBy }[] = [
  { label: t('filters.sortFilters.date_asc'), value: 'date_asc' },
  { label: t('filters.sortFilters.date_desc'), value: 'date_desc' },
  { label: t('filters.sortFilters.price_asc'), value: 'price_asc' },
  { label: t('filters.sortFilters.price_desc'), value: 'price_desc' },
]

const toggleSortBy = (value: SortBy) => {
  selectedSortBy.value = selectedSortBy.value === value ? null : value
  emit('update:modelValue', selectedSortBy.value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    selectedSortBy.value = newValue || null
  }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('filters.sortFilters.sort') }}:</span>
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
