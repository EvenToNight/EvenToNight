<script setup lang="ts">
import type { Conversation } from '@/api/types/chat'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'

interface Props {
  conversation: Conversation
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showBackButton: false,
})

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div class="chat-header">
    <q-btn
      v-if="showBackButton"
      flat
      round
      icon="arrow_back"
      class="back-button"
      @click="emit('back')"
    >
      <q-tooltip>Indietro</q-tooltip>
    </q-btn>
    <q-avatar size="40px">
      <img
        v-if="conversation?.organization.avatar"
        :src="conversation.organization.avatar"
        :alt="conversation.organization.name"
        style="object-fit: cover"
      />
      <q-icon v-else name="business" size="md" />
    </q-avatar>
    <div class="header-info">
      <div class="organization-name">{{ conversation?.organization.name }}</div>
      <div class="status">Online</div>
    </div>
    <q-space />
    <!-- <q-btn flat round icon="more_vert" /> -->
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as *;

.chat-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  height: v-bind(NAVBAR_HEIGHT_CSS);
  background-color: $color-background;
  border-bottom: 1px solid var(--q-separator-color);
  min-height: 60px;

  .back-button {
    margin-right: 8px;
  }

  .header-info {
    margin-left: 12px;

    .organization-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--q-text-primary);
    }

    .status {
      font-size: 13px;
      color: var(--q-primary);
      font-weight: 500;
    }
  }
}

// Dark mode overrides
.body--dark {
  .chat-header {
    background-color: $color-background-dark-soft;
    border-bottom: 1px solid $color-gray-800;
  }
}
</style>
