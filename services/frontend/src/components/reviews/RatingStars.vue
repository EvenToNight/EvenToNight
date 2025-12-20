<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  rating: 0 | 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showNumber: true,
})

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

const stars = computed(() => {
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < props.rating,
    index: i,
  }))
})
</script>

<template>
  <div class="rating-stars">
    <div class="stars" :class="sizeClass">
      <q-icon
        v-for="star in stars"
        :key="star.index"
        :name="star.filled ? 'star' : 'star_border'"
        :class="{ filled: star.filled, empty: !star.filled }"
      />
    </div>
    <span v-if="showNumber" class="rating-number">{{ rating }}/5</span>
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

  .q-icon {
    &.filled {
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
