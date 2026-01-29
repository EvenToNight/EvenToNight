<script setup lang="ts">
import { toRef } from 'vue'
import type { UserLoadResult } from '@/api/utils/userUtils'
import { useUserProfile } from '@/composables/useUserProfile'
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { goToCreateEvent, goToEditProfile, goToSettings, goToChat } = useNavigation()

interface Props {
  user: UserLoadResult
}
const props = defineProps<Props>()

const { isOwnProfile, isOrganization } = useUserProfile(toRef(() => props.user))

const emit = defineEmits<{
  followToggle: []
}>()

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
  goToChat(props.user.id)
}
</script>

<template>
  <div class="profile-actions">
    <template v-if="isOwnProfile">
      <q-btn icon="edit" flat class="action-btn action-btn--secondary" @click="handleEditProfile" />
      <q-btn icon="chat" flat class="action-btn action-btn--secondary" @click="handleOpenChat">
        <q-badge
          v-if="props.user.unreadMessagesCount && props.user.unreadMessagesCount > 0"
          color="red"
          floating
          >{{ String(props.user.unreadMessagesCount) }}</q-badge
        >
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
        v-if="user.interactionsInfo?.isFollowing"
        :label="
          user.interactionsInfo.isFollowing ? t('userProfile.following') : t('userProfile.follow')
        "
        :unelevated="!user.interactionsInfo.isFollowing"
        :flat="user.interactionsInfo.isFollowing"
        :color="!user.interactionsInfo.isFollowing ? 'primary' : undefined"
        :class="[
          'action-btn',
          user.interactionsInfo.isFollowing ? 'action-btn--secondary' : 'action-btn--primary',
        ]"
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
