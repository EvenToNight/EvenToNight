<script setup lang="ts">
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  posterLink: string
  title: string
}>()

const heroImageRef = ref<HTMLDivElement | null>(null)
let ticking = false

const updateParallax = () => {
  if (!heroImageRef.value) return
  const scrolled = window.scrollY
  const parallaxSpeed = 0.5
  const opacity = Math.max(1 - scrolled / 500, 0)
  heroImageRef.value.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
  heroImageRef.value.style.opacity = opacity.toString()
  ticking = false
}

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax)
    ticking = true
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  window.addEventListener('scroll', handleScroll, { passive: true })
  updateParallax()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="hero-image-container">
    <div ref="heroImageRef" class="hero-image-wrapper">
      <img :src="props.posterLink" :alt="props.title" class="hero-image" />
    </div>
    <BackButton />
    <div class="hero-overlay"></div>
  </div>
</template>

<style scoped lang="scss">
.hero-image-container {
  position: relative;
  width: 100%;
  height: 60vh;
  max-height: 600px;
  overflow: hidden;
}

.hero-image-wrapper {
  @include absolute-fill;
  will-change: transform, opacity;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
}

.hero-overlay {
  @include absolute-fill;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}
</style>
