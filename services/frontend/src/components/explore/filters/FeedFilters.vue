<script lang="ts">
export const FEED_FILTERS = ['upcoming', 'popular', 'for_you', 'new', 'nearby'] as const
</script>
<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export type OtherFilter = (typeof FEED_FILTERS)[number]

//TODO use defineModel
interface Props {
  modelValue?: OtherFilter | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: OtherFilter | null]
}>()

const authStore = useAuthStore()
const { t } = useTranslation('components.explore.filters.FeedFilters')
const selectedOtherFilter = ref<OtherFilter | null>(props.modelValue || null)

const otherFilters = computed(() => {
  const filters: { label: string; value: OtherFilter }[] = [
    { label: t('upcoming'), value: 'upcoming' },
    { label: t('popular'), value: 'popular' },
  ]
  if (authStore.isAuthenticated) {
    filters.push({ label: t('forYou'), value: 'for_you' })
  }
  filters.push({ label: t('new'), value: 'new' }, { label: t('nearby'), value: 'nearby' })
  return filters
})

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
    <span class="filter-label">{{ t('others') }}:</span>
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
