<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'

interface Props {
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  seeAll: []
}>()

const $q = useQuasar()
const cardsContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const isDesktop = computed(() => $q.screen.width > parseInt(breakpoints.breakpointMobile!))
const shouldShowNavigation = computed(() => isDesktop.value)

const handleSeeAll = () => {
  emit('seeAll')
}

const updateScrollButtons = () => {
  const container = cardsContainer.value!
  canScrollLeft.value = container.scrollLeft > 5
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth - 5
}

const getCardWidth = () => {
  const container = cardsContainer.value!
  const firstCard = container.querySelector(':scope > *') as HTMLElement
  if (!firstCard) return 0
  const style = window.getComputedStyle(container)
  const gap = parseInt(style.gap) || 0
  return firstCard.offsetWidth + gap
}

const getScrollAmount = () => {
  const container = cardsContainer.value!
  const cardWidth = getCardWidth()
  const containerWidth = container.clientWidth
  const cardsPerView = Math.floor(containerWidth / cardWidth)
  return cardWidth * Math.max(1, cardsPerView)
}

const scroll = (direction: 'left' | 'right') => {
  const container = cardsContainer.value!
  const scrollAmount = getScrollAmount()
  container.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}

const scrollLeft = () => scroll('left')
const scrollRight = () => scroll('right')

onMounted(() => {
  if (cardsContainer.value) {
    cardsContainer.value.addEventListener('scroll', updateScrollButtons)
    setTimeout(updateScrollButtons, 0)
  }
})
</script>

<template>
  <div class="card-slider">
    <div class="slider-header">
      <h2 class="slider-title">{{ title }}</h2>
      <span class="see-all-link" @click="handleSeeAll">
        <span class="see-all-text">See All</span>
        <q-icon name="arrow_forward" size="18px" class="see-all-arrow" />
      </span>
    </div>

    <div class="cards-container-wrapper">
      <div ref="cardsContainer" class="cards-container">
        <slot></slot>
      </div>
    </div>

    <button
      v-if="shouldShowNavigation && canScrollLeft"
      class="nav-arrow nav-arrow-left"
      aria-label="Scroll left"
      @click="scrollLeft"
    >
      <q-icon name="chevron_left" size="32px" />
    </button>
    <button
      v-if="shouldShowNavigation && canScrollRight"
      class="nav-arrow nav-arrow-right"
      aria-label="Scroll right"
      @click="scrollRight"
    >
      <q-icon name="chevron_right" size="32px" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.card-slider {
  position: relative;
  width: 100%;
  margin-bottom: $spacing-8;
  background: transparent;
}

.slider-header {
  @include flex-between;
  margin-bottom: $spacing-4;
}

.slider-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-2xl;
  }
}

.see-all-link {
  @include flex-center;
  gap: $spacing-2;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition:
    transform $transition-base,
    gap $transition-base;
  transform-origin: left center;

  &:hover {
    transform: scale(1.05);
    gap: $spacing-3;
    .see-all-arrow {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: scale(0.95);
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

    @media (max-width: $breakpoint-mobile) {
      width: clamp(180px, 40vw, 320px);
    }
  }
}

.nav-arrow {
  @include flex-center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: color-alpha($color-white, 0.95);
  border: none;
  cursor: pointer;
  transition: all $transition-slow;
  box-shadow: $shadow-md;

  &:hover {
    background: $color-white;
    box-shadow: $shadow-lg;
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
}

.nav-arrow-left {
  left: -24px;
}

.nav-arrow-right {
  right: -24px;
}
</style>
