<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showNumber: true,
  editable: false,
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
  <div class="rating-stars">
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
    <span v-if="showNumber" class="rating-number">{{ displayRating.toFixed(1) }}/5</span>
  </div>
</template>

<style lang="scss" scoped>
.rating-stars {
  display: flex;
  align-items: center;
  gap: $spacing-2;
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

.rating-number {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
