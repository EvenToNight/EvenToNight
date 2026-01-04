<script setup lang="ts">
import Button from '@/components/buttons/basicButtons/Button.vue'
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { goToCreateEvent, goToEditProfile, goToSettings, goToSupport } = useNavigation()

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

const handleOpenSupport = () => {
  goToSupport(props.userId)
}
</script>

<template>
  <div class="profile-actions">
    <template v-if="isOwnProfile">
      <Button
        :label="t('userProfile.editProfile')"
        icon="edit"
        variant="secondary"
        @click="handleEditProfile"
      />
      <Button label="Chats" icon="chat" variant="secondary" @click="handleOpenSupport" />
      <Button
        v-if="isOrganization"
        :label="t('userProfile.createEvent')"
        icon="add"
        variant="primary"
        @click="handleCreateEvent"
      />
      <Button icon="settings" variant="secondary" @click="handleOpenSettings" />
    </template>
    <template v-else>
      <Button
        v-if="isOrganization"
        label="Send a message"
        icon="send"
        variant="secondary"
        @click="handleOpenSupport"
      />
      <Button
        :label="isFollowing ? t('userProfile.following') : t('userProfile.follow')"
        :variant="isFollowing ? 'secondary' : 'primary'"
        @click="handleFollowToggle"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.profile-actions {
  display: flex;
  gap: $spacing-2;
  align-items: stretch;
}
</style>
