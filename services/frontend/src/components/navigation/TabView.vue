<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

export interface Tab {
  id: string
  label: string
  icon?: string
  component: Component
  props?: Record<string, any>
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
}

const props = defineProps<Props>()
const activeTab = defineModel<string>('activeTab')

if (!activeTab.value) {
  activeTab.value = props.defaultTab ?? props.tabs[0]!.id
}

const selectTab = (tabId: string) => {
  activeTab.value = tabId
}

const getCurrentTabComponent = computed((): Tab => {
  const tab = props.tabs.find((t) => t.id === activeTab.value)
  if (!tab) {
    selectTab(props.tabs[0]!.id)
  }
  return tab ?? props.tabs[0]!
})
</script>

<template>
  <div class="explore-tab-header">
    <div class="explore-tab-header-inner">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="explore-tab"
        :class="{ active: activeTab === tab.id }"
        role="button"
        tabindex="0"
        @click="selectTab(tab.id)"
        @keydown.enter="selectTab(tab.id)"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>

  <div class="explore-tab-content">
    <component
      :is="getCurrentTabComponent.component"
      :key="activeTab"
      v-bind="getCurrentTabComponent.props || {}"
    />
  </div>
</template>

<style lang="scss" scoped>
.explore-tab-header {
  position: sticky;
  top: 64px; // NavigationBar height
  z-index: 10; // Below navbar but above content
  backdrop-filter: blur(10px);
  padding: $spacing-4 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;

  @include dark-mode {
    background: rgba(18, 18, 18, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.explore-tab-header-inner {
  display: flex;
  justify-content: safe center;
  gap: $spacing-8;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox
  max-width: $app-max-width;
  margin: 0 auto;
  padding: 0 $spacing-6;

  &::-webkit-scrollbar {
    display: none; // Chrome, Safari
  }

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-6;
    padding: 0 $spacing-4;
  }
  @media (max-width: $app-min-width) {
    gap: $spacing-4;
  }
}

.explore-tab {
  color: $color-heading;
  opacity: 0.6;
  cursor: pointer;
  padding-bottom: $spacing-2;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  user-select: none;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  font-family: $font-family-heading;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }

  &.active {
    opacity: 1;
    border-bottom-color: $color-primary;
  }

  @include dark-mode {
    color: $color-white;
  }
}

.explore-tab-content {
  @include flex-column;
  flex: 1;
  min-height: 0;
  padding: $spacing-6 $spacing-4;
  max-width: $app-max-width;
  width: 100%;
  margin: 0 auto;
  background: transparent;
}
</style>
