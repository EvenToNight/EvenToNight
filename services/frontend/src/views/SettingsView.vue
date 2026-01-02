<script setup lang="ts">
import { ref, computed } from 'vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import TwoColumnLayout from '@/layouts/TwoColumnLayout.vue'
import MyReviewsTab from '@/components/settings/tabs/MyReviewsTab.vue'
import type { Tab } from '@/components/navigation/TabView.vue'

const activeTabId = ref('reviews')

const activeTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTabId.value) ?? tabs.value[0]!
})

const selectTab = (tabId: string) => {
  activeTabId.value = tabId
}

const tabs = computed<Tab[]>(() => [
  {
    id: 'reviews',
    label: 'My Reviews',
    icon: 'rate_review',
    component: MyReviewsTab,
  },
])
</script>

<template>
  <div class="settings-view">
    <div class="settings-container">
      <TwoColumnLayout :sidebar-title="'Settings'">
        <template #sidebar>
          <div class="settings-menu">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="settings-menu-item"
              :class="{ active: activeTabId === tab.id }"
              @click="selectTab(tab.id)"
            >
              <q-icon :name="tab.icon" size="24px" class="menu-icon" />
              <span class="menu-label">{{ tab.label }}</span>
              <q-icon name="chevron_right" size="20px" class="chevron-icon" />
            </button>
          </div>
        </template>

        <template #content>
          <component :is="activeTab.component" />
        </template>

        <template #mobile-title>
          <h3 class="mobile-tab-title">{{ activeTab.label }}</h3>
        </template>
      </TwoColumnLayout>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-view {
  min-height: 100vh;
  position: relative;
  margin-top: calc(-1 * v-bind(NAVBAR_HEIGHT_CSS));
  padding-top: v-bind(NAVBAR_HEIGHT_CSS);
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - v-bind(NAVBAR_HEIGHT_CSS));

  @media (max-width: $breakpoint-mobile) {
    max-width: 100%;
    height: calc(100vh - v-bind(NAVBAR_HEIGHT_CSS));
  }
}

.settings-menu {
  display: flex;
  flex-direction: column;
}

.settings-menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: transparent;
  border: none;
  border-bottom: 1px solid $color-gray-200;
  cursor: pointer;
  transition: background-color $transition-base;
  color: $color-text-primary;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  text-align: left;

  @include dark-mode {
    color: $color-text-dark;
    border-bottom-color: rgba($color-white, 0.1);
  }

  &:hover {
    background: rgba($color-black, 0.04);

    @include dark-mode {
      background: rgba($color-white, 0.04);
    }
  }

  &.active {
    background: rgba($color-primary, 0.08);
    color: $color-primary;

    .menu-icon {
      color: $color-primary;
    }

    @include dark-mode {
      background: rgba($color-primary, 0.12);
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  color: $color-gray-600;
  flex-shrink: 0;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.menu-label {
  flex: 1;
}

.chevron-icon {
  color: $color-gray-400;
  flex-shrink: 0;
  opacity: 0.6;

  @include dark-mode {
    color: $color-gray-500;
  }
}

.mobile-tab-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
