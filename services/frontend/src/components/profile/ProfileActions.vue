<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'

const { t } = useI18n()
const { goToCreateEvent, goToEditProfile, goToSettings, goToChat } = useNavigation()
const authStore = useAuthStore()

interface Props {
  isOwnProfile: boolean
  isOrganization: boolean
  isFollowing: boolean
  userId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  followToggle: []
}>()

const unreadMessagesCount = ref(0)

const loadUnreadMessagesCount = async () => {
  if (authStore.user?.id) {
    try {
      const response = await api.chat.unreadMessageCountFor(authStore.user.id)
      unreadMessagesCount.value = response.unreadCount
    } catch (error) {
      console.error('Failed to load unread messages count:', error)
      unreadMessagesCount.value = 0
    }
  }
}

onMounted(() => {
  loadUnreadMessagesCount()
})

const handleEditProfile = () => {
  goToEditProfile()
}

const handleCreateEvent = () => {
  goToCreateEvent()
}

const handleFollowToggle = () => {
  emit('followToggle')
}

const handleOpenSettings = () => {
  goToSettings()
}

const handleOpenChat = () => {
  goToChat(props.userId)
}
</script>

<template>
  <div class="profile-actions">
    <template v-if="isOwnProfile">
      <q-btn icon="edit" flat class="action-btn action-btn--secondary" @click="handleEditProfile" />
      <q-btn icon="chat" flat class="action-btn action-btn--secondary" @click="handleOpenChat">
        <q-badge v-if="unreadMessagesCount > 0" color="red" floating>{{
          String(unreadMessagesCount)
        }}</q-badge>
      </q-btn>
      <q-btn
        icon="settings"
        flat
        class="action-btn action-btn--secondary"
        @click="handleOpenSettings"
      />
      <q-btn
        v-if="isOrganization"
        :label="t('userProfile.createEvent')"
        icon="add"
        unelevated
        color="primary"
        class="action-btn action-btn--primary"
        @click="handleCreateEvent"
      />
    </template>
    <template v-else>
      <q-btn
        v-if="isOrganization"
        icon="send"
        flat
        class="action-btn action-btn--secondary"
        @click="handleOpenChat"
      />
      <q-btn
        :label="isFollowing ? t('userProfile.following') : t('userProfile.follow')"
        :unelevated="!isFollowing"
        :flat="isFollowing"
        :color="!isFollowing ? 'primary' : undefined"
        :class="['action-btn', isFollowing ? 'action-btn--secondary' : 'action-btn--primary']"
        @click="handleFollowToggle"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.profile-actions {
  display: flex;
  gap: $spacing-2;
  align-items: stretch;
}

.action-btn {
  padding: $spacing-3;
  font-size: $font-size-base;

  &--primary {
    background: $color-primary;
    color: $color-white;

    &:hover {
      background: color.adjust($color-primary, $lightness: -8%);
    }
  }

  &--secondary {
    color: $color-text-primary;

    &:hover {
      background: color-alpha($color-black, 0.04);
    }

    @include dark-mode {
      color: $color-text-dark;
      border-color: color-alpha($color-white, 0.12);

      &:hover {
        background: color-alpha($color-white, 0.04);
      }
    }
  }
}
</style>
