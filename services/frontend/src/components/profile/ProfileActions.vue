<script setup lang="ts">
import Button from '@/components/buttons/basicButtons/Button.vue'
import { useNavigation } from '@/router/utils'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { goToCreateEvent } = useNavigation()

interface Props {
  isOwnProfile: boolean
  isOrganization: boolean
  isFollowing: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  editProfile: []
  createEvent: []
  followToggle: []
}>()

const handleEditProfile = () => {
  emit('editProfile')
}

const handleCreateEvent = () => {
  emit('createEvent')
  goToCreateEvent()
}

const handleFollowToggle = () => {
  emit('followToggle')
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
      <Button
        v-if="isOrganization"
        :label="t('userProfile.createEvent')"
        icon="add"
        variant="primary"
        @click="handleCreateEvent"
      />
    </template>
    <template v-else>
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
