<script setup lang="ts">
import Button from '@/components/buttons/basicButtons/Button.vue'
import { useNavigation } from '@/router/utils'

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
      <Button label="Edit Profile" icon="edit" variant="secondary" @click="handleEditProfile" />
      <Button
        v-if="isOrganization"
        label="Create Event"
        icon="add"
        variant="primary"
        @click="handleCreateEvent"
      />
    </template>
    <template v-else>
      <Button
        :label="isFollowing ? 'Following' : 'Follow'"
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
  align-items: center;
}
</style>
