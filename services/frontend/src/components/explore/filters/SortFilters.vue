<script setup lang="ts">
import { ref, watch } from 'vue'

export type SortBy = 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc'

interface Props {
  modelValue?: SortBy | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: SortBy | null]
}>()

const selectedSortBy = ref<SortBy | null>(props.modelValue || null)

const sortByOptions: { label: string; value: SortBy }[] = [
  { label: 'Data crescente', value: 'date_asc' },
  { label: 'Data decrescente', value: 'date_desc' },
  { label: 'Prezzo più basso', value: 'price_asc' },
  { label: 'Prezzo più alto', value: 'price_desc' },
]

const toggleSortBy = (value: SortBy) => {
  selectedSortBy.value = selectedSortBy.value === value ? null : value
  emit('update:modelValue', selectedSortBy.value)
}

// Sync with parent when modelValue changes (for clear filters)
watch(
  () => props.modelValue,
  (newValue) => {
    selectedSortBy.value = newValue || null
  }
)
</script>

<template>
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
