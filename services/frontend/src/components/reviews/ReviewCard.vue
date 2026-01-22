<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import { useQuasar } from 'quasar'
import type { EventReview } from '@/api/types/interaction'
import type { Event } from '@/api/types/events'
import RatingStars from './ratings/RatingStars.vue'
import SubmitReviewDialog from './SubmitReviewDialog.vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'

interface Props {
  review: EventReview
  showEventInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEventInfo: true,
})

const { goToUserProfile, goToEventDetails } = useNavigation()
const authStore = useAuthStore()
const $q = useQuasar()

const deleteReview = inject<((eventId: string, userId: string) => void) | undefined>(
  'deleteReview',
  undefined
)

const isOwnReview = computed(() => {
  return authStore.user?.id === props.review.userId
})

const userName = ref<string>('Loading...')
const userAvatar = ref<string | null>(null)
const eventInfo = ref<Event | null>(null)
const showEditDialog = ref(false)

const loadUserInfo = async () => {
  try {
    const user = await api.users.getUserById(props.review.userId)
    userName.value = user.name
    userAvatar.value = user.avatar || null
  } catch (error) {
    console.error('Failed to load user info:', error)
    userName.value = 'Unknown User'
  }
}

const loadEventInfo = async () => {
  if (!props.showEventInfo) return
  try {
    eventInfo.value = await api.events.getEventById(props.review.eventId)
  } catch (error) {
    console.error('Failed to load event info:', error)
  }
}

const handleUserClick = () => {
  goToUserProfile(props.review.userId)
}

const handleEventClick = () => {
  if (eventInfo.value) {
    goToEventDetails(props.review.eventId)
  }
}

const handleDelete = () => {
  $q.dialog({
    title: 'Conferma eliminazione',
    message: 'Sei sicuro di voler eliminare questa recensione?',
    cancel: {
      flat: true,
      textColor: 'black',
      label: 'Annulla',
    },
    ok: {
      color: 'negative',
      textColor: 'black',
      label: 'Elimina',
    },
    focus: 'none',
  }).onOk(async () => {
    try {
      await api.interactions.deleteEventReview(props.review.eventId, props.review.userId)
      deleteReview?.(props.review.eventId, props.review.userId)
    } catch (error) {
      console.error('Failed to delete review:', error)
      $q.notify({
        type: 'negative',
        message: "Errore durante l'eliminazione della recensione",
      })
    }
  })
}

onMounted(() => {
  loadUserInfo()
  loadEventInfo()
})
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="user-info flex items-center">
        <q-avatar size="40px" class="user-avatar cursor-pointer" @click="handleUserClick">
          <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
          <q-icon v-else name="person" />
        </q-avatar>
        <div class="user-details flex column items-start">
          <span class="user-name cursor-pointer" @click="handleUserClick">{{ userName }}</span>
          <RatingStars :rating="review.rating" size="sm" variant="compact" />
        </div>
      </div>
      <q-btn v-if="isOwnReview" flat round dense icon="more_vert" class="review-menu-btn">
        <q-menu>
          <q-list>
            <q-item v-close-popup clickable @click="showEditDialog = true">
              <q-item-section avatar>
                <q-icon name="edit" />
              </q-item-section>
              <q-item-section>Modifica</q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="handleDelete">
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>
              <q-item-section>Elimina</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <div class="review-body">
      <div
        v-if="showEventInfo && eventInfo"
        class="event-info flex items-center cursor-pointer"
        @click="handleEventClick"
      >
        <q-icon name="event" class="event-icon" />
        <span class="event-title">{{ eventInfo.title }}</span>
      </div>
      <h3 class="review-title">{{ review.title }}</h3>
      <p class="review-description">{{ review.comment }}</p>
    </div>

    <SubmitReviewDialog
      v-model:isOpen="showEditDialog"
      :creator-id="review.creatorId"
      :selected-event-id="review.eventId"
      :existing-review="review"
    />
  </div>
</template>

<style lang="scss" scoped>
.review-card {
  background: $color-background;
  border-radius: $radius-lg;
  padding: $spacing-4;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-3;
}

.user-info {
  gap: $spacing-3;
}

.review-menu-btn {
  opacity: 0.3;
  transition: opacity $transition-base;

  &:hover {
    opacity: 1;
  }
}

.user-avatar {
  background: $color-primary-light;
  transition: transform $transition-base;

  &:hover {
    transform: scale(1.05);
  }

  @include dark-mode {
    background: $color-primary-dark;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: $color-primary;
  }
}

.user-details {
  gap: $spacing-1;
}

.user-name {
  font-weight: 600;
  font-size: $font-size-base;
  color: $color-text-primary;
  transition: all $transition-base;

  &:hover {
    text-decoration: underline;
  }

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.review-body {
  padding-left: calc(40px + #{$spacing-3});
}

.event-info {
  gap: $spacing-2;
  color: $color-primary;
  margin-bottom: $spacing-3;
  transition: all $transition-base;

  .event-icon {
    font-size: 1rem;

    @include dark-mode {
      color: $color-primary-light;
    }
  }

  .event-title {
    font-size: $font-size-sm;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
    @include dark-mode {
      color: $color-primary-light;
    }
  }
}

.review-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0 0 $spacing-2 0;

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.review-description {
  color: $color-text-secondary;
  font-size: $font-size-sm;
  line-height: 1.6;
  margin: 0;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
