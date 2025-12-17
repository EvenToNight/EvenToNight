<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api'
import type { TagCategory } from '@/api/interfaces/events'
import type { Tag } from '@/api/types/events'
import { useI18n } from 'vue-i18n'

interface Props {
  modelValue?: Tag[]
}

const { t } = useI18n()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Tag[]]
}>()

const selectedTags = ref<Tag[]>(props.modelValue || [])
const tagFilters = ref<Tag[]>([])

const loadTagFilters = async () => {
  try {
    const tagCategories: TagCategory[] = await api.events.getTags()
    tagFilters.value = tagCategories.flatMap((category) => category.tags)
  } catch (err) {
    console.error('Failed to load tag filters:', err)
  }
}

const toggleTag = (tag: Tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emit('update:modelValue', selectedTags.value)
}

onMounted(() => {
  loadTagFilters()
})

watch(
  () => props.modelValue,
  (newValue) => {
    selectedTags.value = newValue || []
  },
  { deep: true }
)
</script>

<template>
  <div class="filter-group">
    <span class="filter-label">{{ t('filters.TagFilters.tags') }}:</span>
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
