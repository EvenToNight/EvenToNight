<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import { useSlots } from 'vue'

const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

interface Props {
  sidebarTitle?: string
}

withDefaults(defineProps<Props>(), {
  sidebarTitle: '',
})

const emit = defineEmits<{
  back: []
}>()

const $q = useQuasar()
const showContent = ref(false)

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)

const slots = useSlots()
const hasMobileTitleSlot = computed(() => !!slots['mobile-title'])
const handleBack = () => {
  showContent.value = false
  emit('back')
}

defineExpose({
  showContent: () => {
    showContent.value = true
  },
  showSidebar: () => {
    showContent.value = false
  },
})

const mainStyle = computed(() => {
  const height =
    isMobile.value && showContent.value ? '100dvh' : `calc(100dvh - ${NAVBAR_HEIGHT_CSS})`

  return {
    height,
    minHeight: height,
  }
})
</script>

<template>
  <NavigationButtons v-if="!(isMobile && showContent)" />
  <div class="two-column-layout" :style="mainStyle">
    <div v-show="!isMobile || !showContent" class="sidebar" :class="{ 'mobile-full': isMobile }">
      <div v-if="sidebarTitle" class="sidebar-header">
        <h2 class="sidebar-title">{{ sidebarTitle }}</h2>
      </div>
      <div class="sidebar-content">
        <slot name="sidebar" />
      </div>
    </div>

    <div v-show="!isMobile || showContent" class="content" :class="{ 'mobile-full': isMobile }">
      <div v-if="hasMobileTitleSlot && isMobile && showContent" class="mobile-header">
        <q-btn flat round dense icon="arrow_back" class="back-button" @click="handleBack" />
        <slot name="mobile-title" />
      </div>

      <div class="content-body">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.two-column-layout {
  display: flex;
  gap: 0;
  background: #f5f5f5;

  @include dark-mode {
    background: #121212;
  }

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
  }
}

.sidebar {
  width: 340px;
  min-width: 340px;
  min-height: calc(100vh - v-bind(NAVBAR_HEIGHT_CSS));
  background: $color-white;
  border-right: 1px solid $color-gray-200;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @include dark-mode {
    background: $color-background-dark;
    border-right-color: rgba($color-white, 0.1);
  }

  &.mobile-full {
    width: 100%;
    min-width: 100%;
    border-right: none;
  }
}

.sidebar-header {
  padding: $spacing-6;
  border-bottom: 1px solid $color-gray-200;

  @include dark-mode {
    border-bottom-color: rgba($color-white, 0.1);
  }
}

.sidebar-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: $color-white;

  @include dark-mode {
    background: $color-background-dark;
  }

  &.mobile-full {
    width: 100%;
  }
}

.mobile-header {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background: $color-white;
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: $shadow-sm;

  @include dark-mode {
    background: $color-background-dark-soft;
    border-bottom: 1px solid rgba($color-white, 0.05);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

.back-button {
  margin-right: $spacing-2;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
