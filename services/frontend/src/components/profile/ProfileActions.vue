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
      <Button
        label="Edit Profile"
        icon="edit"
        variant="secondary"
        class="action-btn secondary-btn"
        @click="handleEditProfile"
      />
      <Button
        v-if="isOrganization"
        label="Create Event"
        icon="add"
        variant="primary"
        class="action-btn primary-btn"
        @click="handleCreateEvent"
      />
    </template>
    <template v-else>
      <Button
        :label="isFollowing ? 'Following' : 'Follow'"
        :variant="isFollowing ? 'secondary' : 'primary'"
        :class="['action-btn', isFollowing ? 'secondary-btn' : 'primary-btn']"
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
  align-items: center;
}

.action-btn {
  font-size: $font-size-sm;
  padding: $spacing-2;
}

.primary-btn {
  background: $color-primary;
  color: $color-white;

  &:hover {
    background: color.adjust($color-primary, $lightness: -8%);
  }
}

.secondary-btn {
  border: 1px solid color-alpha($color-black, 0.12);
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
</style>
