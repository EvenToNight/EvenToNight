<script setup lang="ts">
import { computed } from 'vue'
import { RATING_VALUES } from '@/api/types/interaction'

interface Props {
  rating: number
  showNumber?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  editable: false,
  size: 'md',
  variant: 'default',
})

const emit = defineEmits<{
  'update:rating': [rating: number]
}>()

const model = computed({
  get: () => props.rating,
  set: (value) => emit('update:rating', value),
})

const formattedRating = computed(() => {
  const rating = props.rating
  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)
})

const maxRating = computed(() => Math.max(...RATING_VALUES))

const iconSize = computed(() => {
  if (props.size === 'sm') return '1.2em'
  if (props.size === 'lg') return '2em'
  return '1.5em'
})

const ratingNumberClass = computed(() => {
  if (props.size === 'sm') return { fontSize: '2rem', lineHeight: 1 }
  if (props.size === 'lg') return { fontSize: '7rem', lineHeight: 1 }
  return { fontSize: '5rem', lineHeight: 1 }
})

const compactRatingClass = computed(() => {
  if (props.size === 'sm') return 'text-overline'
  if (props.size === 'lg') return 'text-subtitle1'
  return 'text-subtitle2'
})
</script>

<template>
  <div
    :class="[
      props.variant === 'default' ? 'flex column items-center q-gutter-y-xs' : 'flex items-center',
    ]"
  >
    <span
      v-if="showNumber && props.variant === 'default'"
      class="text-weight-light"
      :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-9'"
      :style="ratingNumberClass"
    >
      {{ formattedRating }}
    </span>

    <q-rating
      v-model="model"
      :max="5"
      :size="iconSize"
      :readonly="!props.editable"
      color="warning"
      color-half="warning"
      icon="star_border"
      icon-selected="star"
      icon-half="star_half"
      class="no-shadow"
    />

    <span
      v-if="showNumber && props.variant === 'compact'"
      class="text-weight-bold q-ml-sm text-grey"
      :class="compactRatingClass"
    >
      {{ formattedRating }}/{{ maxRating }}
    </span>
  </div>
</template>

<style scoped>
:deep(.q-rating__icon) {
  text-shadow: none !important;
}
</style>
