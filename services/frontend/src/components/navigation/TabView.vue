<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'

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
  variant: 'explore' | 'profile'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:activeTab': [tabId: string]
}>()

const activeTab = ref(props.defaultTab || props.tabs[0]!.id)

const selectTab = (tabId: string) => {
  activeTab.value = tabId
  emit('update:activeTab', tabId)
}

const getCurrentTabComponent = (): Tab => {
  const tab = props.tabs.find((t) => t.id === activeTab.value)
  return tab ?? props.tabs[0]!
}
</script>

<template>
  <template v-if="props.variant === 'explore'">
    <!-- Explore variant: header and content as siblings for sticky to work -->
    <div class="explore-tab-header">
      <div class="explore-tab-header-inner">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="explore-tab"
          :class="{ active: activeTab === tab.id }"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </div>
      </div>
    </div>

    <div class="explore-tab-content">
      <component
        :is="getCurrentTabComponent().component"
        v-bind="getCurrentTabComponent().props || {}"
      />
    </div>
  </template>

  <!-- Profile variant: traditional wrapped structure -->
  <div v-else class="profile-tab-view">
    <div class="profile-tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['profile-tab-button', { active: activeTab === tab.id }]"
        @click="selectTab(tab.id)"
      >
        <q-icon v-if="tab.icon" :name="tab.icon" size="20px" class="tab-icon" />
        <span class="profile-tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="profile-tab-content">
      <component
        :is="getCurrentTabComponent().component"
        v-bind="getCurrentTabComponent().props || {}"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-tab-view {
  background: $color-background;
  border-radius: $radius-2xl;
  box-shadow: $shadow-base;

  @include dark-mode {
    background: $color-background-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.profile-tab-header {
  display: flex;
  gap: $spacing-2;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-6;

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.profile-tab-button {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: inherit;
  opacity: 0.6;
  transition: all $transition-slow;
  margin-bottom: -2px;

  &.active {
    opacity: 1;
    border-bottom-color: $color-primary;
    color: $color-primary;
    font-weight: $font-weight-semibold; //check

    //check
    .tab-icon {
      color: $color-primary;
    }
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }

  @media (max-width: $breakpoint-mobile) {
    flex: 1;
    justify-content: center;
    font-size: $font-size-sm;
    padding: $spacing-2 $spacing-3;
  }
}

.profile-tab-icon {
  color: inherit;
}

.profile-tab-label {
  color: inherit;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-sm;
  }
}

.profile-tab-content {
  flex: 1;
  min-height: 0;
}

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
  flex: 1;
  min-height: 0;
  padding: $spacing-6 $spacing-4;
  max-width: $app-max-width;
  width: 100%;
  margin: 0 auto;
  background: transparent;
}
</style>
