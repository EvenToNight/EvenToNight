<script setup lang="ts">
import type { ChatUser } from '@/api/types/chat'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import { useNavigation } from '@/router/utils'

interface Props {
  selectedChatUser: ChatUser
  showBackButton?: boolean
}

withDefaults(defineProps<Props>(), {
  showBackButton: false,
})

const emit = defineEmits<{
  back: []
}>()

const { goToUserProfile } = useNavigation()
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
      <img :src="selectedChatUser.avatar" :alt="selectedChatUser.name" style="object-fit: cover" />
    </q-avatar>
    <div class="header-info">
      <div class="user-name cursor-pointer" @click="goToUserProfile(selectedChatUser.id)">
        {{ selectedChatUser.name }}
      </div>
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

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--q-text-primary);

      transition: all $transition-base;

      &:hover {
        text-decoration: underline;
      }
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
