<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { RATING_VALUES } from '@/api/types/interaction'

type StarType = 'filled' | 'half' | 'empty'

interface Props {
  rating: number
  showNumber?: boolean
  variant?: 'default' | 'compact'
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  editable: false,
  variant: 'default',
})

const emit = defineEmits<{
  'update:rating': [rating: number]
}>()

const $q = useQuasar()
const hoverRating = ref<number | null>(null)

const displayRating = computed(() => {
  return hoverRating.value !== null ? hoverRating.value : props.rating
})

const formattedRating = computed(() => {
  const rating = displayRating.value
  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)
})

const maxRating = computed(() => Math.max(...RATING_VALUES))

const getStarType = (index: number): StarType => {
  const position = index + 1
  const rating = displayRating.value
  if (rating >= position) return 'filled'
  if (rating >= position - 0.5) return 'half'
  return 'empty'
}

const stars = computed(() => {
  return Array.from({ length: 5 }, (_, i) => ({
    type: getStarType(i),
    index: i,
  }))
})

const handleStarClick = (index: number) => {
  if (props.editable) {
    const newRating = index + 1
    emit('update:rating', newRating)
  }
}

const handleStarHover = (index: number) => {
  if (props.editable) {
    hoverRating.value = index + 1
  }
}

const handleMouseLeave = () => {
  if (props.editable) {
    hoverRating.value = null
  }
}

const getStarColor = (type: StarType) => {
  if (type === 'filled' || type === 'half') return 'warning'
  return $q.dark.isActive ? 'grey-8' : 'grey-5'
}
</script>

<template>
  <div
    class="q-gutter-y-xs"
    :class="[
      props.variant === 'default' ? 'flex column items-center' : 'flex items-center q-gutter-x-xs',
    ]"
  >
    <span
      v-if="showNumber && props.variant === 'default'"
      class="text-weight-light"
      :class="$q.dark.isActive ? 'text-grey-3' : 'text-grey-9'"
      :style="{ fontSize: '5rem', lineHeight: 1 }"
    >
      {{ formattedRating }}
    </span>

    <div class="flex q-gutter-x-xs" @mouseleave="handleMouseLeave">
      <q-icon
        v-for="star in stars"
        :key="star.index"
        :name="star.type === 'filled' ? 'star' : star.type === 'half' ? 'star_half' : 'star_border'"
        :class="['text-h5', props.editable ? 'cursor-pointer star-hover' : '']"
        :color="getStarColor(star.type)"
        @click="handleStarClick(star.index)"
        @mouseenter="handleStarHover(star.index)"
      />
    </div>

    <span
      v-if="showNumber && props.variant === 'compact'"
      class="text-weight-bold"
      :class="['text-subtitle2', $q.dark.isActive ? 'text-grey-5' : 'text-grey-7']"
    >
      {{ formattedRating }}/{{ maxRating }}
    </span>
  </div>
</template>

<style scoped>
.star-hover {
  transition: transform 0.2s ease;
}

.star-hover:hover {
  transform: scale(1.2);
}
</style>
