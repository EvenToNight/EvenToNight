<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useNavigation } from '@/router/utils'
import { api } from '@/api'
import type { User, UserID } from '@/api/types/users'
import type { Event } from '@/api/types/events'
import { ref, onMounted } from 'vue'
interface Props {
  event: Event
}
const props = defineProps<Props>()
const { t } = useI18n()
const { goToUserProfile } = useNavigation()

const organizer = ref<User | null>(null)
const collaborators = ref<User[]>([])

const loadOrganizer = async (userId: UserID) => {
  try {
    const response = await api.users.getUserById(userId)
    organizer.value = response.user
  } catch (error) {
    console.error('Failed to load organizer:', error)
    organizer.value = null
  }
}

const loadCollaborators = async (userIds: UserID[]) => {
  try {
    const promises = userIds.map((userId) => api.users.getUserById(userId))
    const responses = await Promise.all(promises)
    collaborators.value = responses.map((response) => response.user)
  } catch (error) {
    console.error('Failed to load collaborators:', error)
    collaborators.value = []
  }
}

onMounted(async () => {
  const promises = []
  promises.push(loadOrganizer(props.event.creatorId))
  if (props.event.collaboratorIds?.length) {
    promises.push(loadCollaborators(props.event.collaboratorIds))
  }
  await Promise.all(promises)
})
</script>

<template>
  <div v-if="organizer" class="organizer-section">
    <h3 class="section-subtitle">{{ t('eventDetails.organizer') }}</h3>
    <div class="organizer-card" @click="goToUserProfile(event.creatorId)">
      <img
        v-if="organizer.avatarUrl"
        :src="organizer.avatarUrl"
        :alt="organizer.name"
        class="organizer-avatar"
      />
      <div class="organizer-info">
        <h4 class="organizer-name">{{ organizer.name }}</h4>
        <p v-if="organizer.bio" class="organizer-description">
          {{ organizer.bio }}
        </p>
      </div>
    </div>
  </div>

  <div v-if="collaborators.length > 0" class="collaborators-section">
    <h3 class="section-subtitle">{{ t('eventDetails.collaborators') }}</h3>
    <div class="collaborators-list">
      <div
        v-for="collab in collaborators"
        :key="collab.id"
        class="collaborator-card"
        @click="goToUserProfile(collab.id)"
      >
        <img
          v-if="collab.avatarUrl"
          :src="collab.avatarUrl"
          :alt="collab.name"
          class="collaborator-avatar"
        />
        <span class="collaborator-name">{{ collab.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.organizer-section {
  margin-bottom: $spacing-6;
}

.section-subtitle {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin-bottom: $spacing-4;
  opacity: 0.7;
}

.organizer-card {
  @include flex-center;
  gap: $spacing-4;
  padding: $spacing-4;
  border-radius: $radius-2xl;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all $transition-slow;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    background: rgba(0, 0, 0, 0.04);

    @include dark-mode {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-3;
    gap: $spacing-3;
  }
}

.organizer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid $color-primary;

  @media (max-width: $breakpoint-mobile) {
    width: 56px;
    height: 56px;
  }
}

.organizer-info {
  flex: 1;
  min-width: 0;
}

.organizer-name {
  font-size: $font-size-lg;
  margin-bottom: $spacing-1;
  font-weight: $font-weight-semibold;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-base;
  }
}

.organizer-description {
  font-size: $font-size-base;
  opacity: 0.7;
  line-height: 1.4;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-sm;
  }
}

.collaborators-section {
  margin-bottom: $spacing-8;
}

.collaborators-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
}

.collaborator-card {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $radius-xl;
  background: rgba(0, 0, 0, 0.02);
  transition: all $transition-slow;
  cursor: default;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    @include dark-mode {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-2;
  }
}

.collaborator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba($color-primary, 0.5);

  @media (max-width: $breakpoint-mobile) {
    width: 36px;
    height: 36px;
  }
}

.collaborator-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-sm;
  }
}
</style>
