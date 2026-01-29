<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SeeAllButton from '../buttons/basicButtons/SeeAllButton.vue'
import { useBreakpoints } from '@/composables/useBreakpoints'

interface Props {
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  seeAll: []
}>()

const { t } = useI18n()
const { isMobile } = useBreakpoints()
const cardsContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const shouldShowNavigation = computed(() => !isMobile.value)

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
  <div class="card-slider q-mb-lg">
    <div class="row justify-between items-center q-mb-md">
      <h2 class="text-h4 text-weight-bold q-ma-none">{{ title }}</h2>
      <see-all-button @click="emit('seeAll')" />
    </div>

    <div class="cards-container-wrapper">
      <div ref="cardsContainer" class="cards-container">
        <slot></slot>
      </div>
    </div>

    <q-btn
      v-if="shouldShowNavigation && canScrollLeft"
      flat
      round
      icon="chevron_left"
      size="18px"
      class="nav-arrow nav-arrow-left shadow-2"
      :aria-label="t('cards.slider.scrollLeftAriaLabel')"
      @click="scrollLeft"
    />
    <q-btn
      v-if="shouldShowNavigation && canScrollRight"
      flat
      round
      icon="chevron_right"
      size="18px"
      class="nav-arrow nav-arrow-right shadow-2"
      :aria-label="t('cards.slider.scrollRightAriaLabel')"
      @click="scrollRight"
    />
  </div>
</template>

<style scoped lang="scss">
.card-slider {
  position: relative;
  width: 100%;
  background: transparent;
}

.text-h4 {
  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-2xl;
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
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: color-alpha($color-white, 0.95) !important;
  transition: all $transition-slow;
  color: $color-black !important;

  &:hover {
    background: $color-white !important;
    box-shadow: $shadow-lg !important;
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
}

// .nav-arrow-left {
//   left: -24px;
// }

// .nav-arrow-right {
//   right: -24px;
// }
</style>
