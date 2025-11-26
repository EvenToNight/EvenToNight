<template>
  <div class="card-slider">
    <!-- Header with Title and See All Button -->
    <div class="slider-header">
      <h2 class="slider-title">{{ title }}</h2>
      <span class="see-all-link" @click="handleSeeAll">
        <span class="see-all-text">See All</span>
        <q-icon name="arrow_forward" size="18px" class="see-all-arrow" />
      </span>
    </div>

    <!-- Cards Container with Horizontal Scroll -->
    <div class="cards-container-wrapper">
      <div ref="cardsContainer" class="cards-container">
        <slot></slot>
      </div>
    </div>

    <!-- Optional Navigation Arrows for Desktop -->
    <button
      v-if="showNavigation && canScrollLeft"
      class="nav-arrow nav-arrow-left"
      aria-label="Scroll left"
      @click="scrollLeft"
    >
      <q-icon name="chevron_left" size="32px" />
    </button>
    <button
      v-if="showNavigation && canScrollRight"
      class="nav-arrow nav-arrow-right"
      aria-label="Scroll right"
      @click="scrollRight"
    >
      <q-icon name="chevron_right" size="32px" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  title: string
  showNavigation?: boolean
}

withDefaults(defineProps<Props>(), {
  showNavigation: true,
})

const emit = defineEmits<{
  seeAll: []
}>()

const cardsContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const handleSeeAll = () => {
  emit('seeAll')
}

const updateScrollButtons = () => {
  if (!cardsContainer.value) return

  const container = cardsContainer.value
  // Add a small threshold to avoid rounding issues
  canScrollLeft.value = container.scrollLeft > 5
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5
}

const scrollLeft = () => {
  if (!cardsContainer.value) return
  const scrollAmount = cardsContainer.value.clientWidth * 0.8
  cardsContainer.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  })
}

const scrollRight = () => {
  if (!cardsContainer.value) return
  const scrollAmount = cardsContainer.value.clientWidth * 0.8
  cardsContainer.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  })
}

onMounted(() => {
  if (cardsContainer.value) {
    cardsContainer.value.addEventListener('scroll', updateScrollButtons)
    // Initial check
    setTimeout(updateScrollButtons, 100)
  }
})

onUnmounted(() => {
  if (cardsContainer.value) {
    cardsContainer.value.removeEventListener('scroll', updateScrollButtons)
  }
})
</script>

<style scoped lang="scss">
.card-slider {
  position: relative;
  width: 100%;
  margin-bottom: $spacing-8;
  background: transparent;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-4;
  padding: 0 $spacing-2;

  @media (max-width: 768px) {
    padding: 0;
  }
}

.slider-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.see-all-link {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--q-primary);
  transition: gap 0.3s ease;
  user-select: none;

  &:hover {
    gap: $spacing-3;

    .see-all-arrow {
      transform: translateX(4px);
    }
  }

  .see-all-text {
    transition: transform 0.3s ease;
  }

  .see-all-arrow {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
    color: currentColor;

    @include light-mode {
      color: #000 !important;
    }

    @include dark-mode {
      color: #fff !important;
    }
  }
}

.cards-container-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.cards-container {
  display: flex;
  gap: $spacing-8;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: $spacing-2 0;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;

  /* Snap scrolling on mobile */
  scroll-snap-type: x mandatory;

  > * {
    flex: 0 0 auto;
    scroll-snap-align: start;
    width: 320px;

    &:first-child {
      margin-left: 0;
    }

    @media (max-width: 768px) {
      width: calc((100vw - 64px) / 1.5 - 32px);
      max-width: 280px;
      min-width: 180px;
    }
  }
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 768px) {
    display: none;
  }
}

.nav-arrow-left {
  left: -24px;
}

.nav-arrow-right {
  right: -24px;
}
</style>
