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
}

const props = defineProps<Props>()

const activeTab = ref(props.defaultTab || props.tabs[0]!.id)

const selectTab = (tabId: string) => {
  activeTab.value = tabId
}

const getCurrentTabComponent = (): Tab => {
  const tab = props.tabs.find((t) => t.id === activeTab.value)
  return tab ?? props.tabs[0]!
}
</script>

<template>
  <div class="tab-view">
    <div class="tab-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="selectTab(tab.id)"
      >
        <q-icon v-if="tab.icon" :name="tab.icon" size="20px" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="tab-content">
      <component
        :is="getCurrentTabComponent().component"
        v-bind="getCurrentTabComponent().props || {}"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-view {
  background: var(--q-background);
  border-radius: 16px;
  box-shadow: $shadow-base;
  padding: $spacing-6;
  margin-bottom: $spacing-6;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    padding: $spacing-4;
  }
}

.tab-header {
  display: flex;
  gap: $spacing-2;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-6;

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.6;
  transition: all 0.3s ease;
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

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    font-size: 0.875rem;
    padding: $spacing-2 $spacing-3;
  }
}

.tab-icon {
  color: inherit;
}

.tab-label {
  color: inherit;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-sm;
  }
}

.tab-content {
  flex: 1;
  min-height: 0;
}
</style>
