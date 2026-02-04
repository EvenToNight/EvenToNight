<script setup lang="ts">
import type { ChatUser } from '@/api/types/chat'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import { useNavigation } from '@/router/utils'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { api } from '@/api'
import type { OnlineInfoEvent } from '@/api/types/notifications'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  selectedChatUser: ChatUser
  showBackButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
})

const emit = defineEmits<{
  back: []
}>()
const { t } = useTranslation('components.chat.ChatHeader')
const isOnline = ref(false)
watch(
  () => props.selectedChatUser,
  async (newUser) => {
    const status = await api.notifications.isUserOnline(newUser.id)
    isOnline.value = status.isOnline
  },
  { immediate: true }
)

const onlineStatusHandler = (event: OnlineInfoEvent) => {
  if (event.userId === props.selectedChatUser.id) {
    isOnline.value = event.isOnline
  }
}
const { goToUserProfile } = useNavigation()
onMounted(() => {
  api.notifications.onUserOnline(onlineStatusHandler)
})
onUnmounted(() => {
  api.notifications.offUserOnline(onlineStatusHandler)
})
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
    </q-btn>
    <q-avatar size="40px">
      <img :src="selectedChatUser.avatar" :alt="selectedChatUser.name" style="object-fit: cover" />
    </q-avatar>
    <div class="header-info">
      <div
        class="user-name cursor-pointer"
        role="button"
        tabindex="0"
        @click="goToUserProfile(selectedChatUser.id)"
        @keydown.enter="goToUserProfile(selectedChatUser.id)"
      >
        {{ selectedChatUser.name }}
      </div>
      <div v-if="isOnline" class="status">{{ t('online') }}</div>
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

.body--dark {
  .chat-header {
    background-color: $color-background-dark-soft;
    border-bottom: 1px solid $color-gray-800;
  }
}
</style>
