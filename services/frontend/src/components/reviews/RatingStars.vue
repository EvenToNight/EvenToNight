<script setup lang="ts">
import { computed, ref } from 'vue'
import { RATING_VALUES } from '@/api/types/interaction'

interface Props {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  variant?: 'default' | 'compact'
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showNumber: true,
  editable: false,
  variant: 'default',
})

const emit = defineEmits<{
  'update:rating': [rating: number]
}>()

const hoverRating = ref<number | null>(null)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm'
    case 'lg':
      return 'text-2xl'
    default:
      return 'text-lg'
  }
})

const displayRating = computed(() => {
  return hoverRating.value !== null ? hoverRating.value : props.rating
})

const formattedRating = computed(() => {
  const rating = displayRating.value
  return Number.isInteger(rating) ? rating.toFixed(0) : rating.toFixed(1)
})

const maxRating = computed(() => Math.max(...RATING_VALUES))

const getStarType = (index: number): 'filled' | 'half' | 'empty' => {
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
</script>

<template>
  <div
    class="rating-stars"
    :class="{
      'rating-stars--default': props.variant === 'default',
      'rating-stars--compact': props.variant === 'compact',
    }"
  >
    <span v-if="showNumber && props.variant === 'default'" class="rating-number">{{
      formattedRating
    }}</span>
    <div class="stars" :class="[sizeClass, { editable }]" @mouseleave="handleMouseLeave">
      <q-icon
        v-for="star in stars"
        :key="star.index"
        :name="star.type === 'filled' ? 'star' : star.type === 'half' ? 'star_half' : 'star_border'"
        :class="{
          filled: star.type === 'filled',
          half: star.type === 'half',
          empty: star.type === 'empty',
        }"
        @click="handleStarClick(star.index)"
        @mouseenter="handleStarHover(star.index)"
      />
    </div>
    <span v-if="showNumber && props.variant === 'compact'" class="rating-number-compact"
      >{{ formattedRating }}/{{ maxRating }}</span
    >
  </div>
</template>

<style lang="scss" scoped>
.rating-stars {
  gap: $spacing-2;

  &--default {
    @include flex-column-center;
  }
  &--compact {
    display: flex;
    align-items: center;
  }
}
.rating-number {
  font-size: 5rem;
  font-weight: 300;
  color: $color-text-primary;
  line-height: 1;

  @include dark-mode {
    color: $color-heading-dark;
  }
}
.stars {
  display: flex;
  gap: $spacing-1;

  &.editable {
    .q-icon {
      cursor: pointer;
      transition: transform $transition-base;

      &:hover {
        transform: scale(1.2);
      }
    }
  }

  .q-icon {
    &.filled,
    &.half {
      color: $color-warning;
    }

    &.empty {
      color: $color-text-muted;

      @include dark-mode {
        color: $color-text-dark;
      }
    }
  }
}

.rating-number-compact {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
