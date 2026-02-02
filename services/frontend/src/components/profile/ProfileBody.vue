<script setup lang="ts">
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import TicketsTab from './tabs/TicketsTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import ReviewsTab from './tabs/ReviewsTab.vue'
import MyLikesTab from './tabs/MyLikesTab.vue'
import type { User } from '@/api/types/users'
import { computed, onMounted, ref, watch } from 'vue'
import type { EventStatus } from '@/api/types/events'
import { useNavigation } from '@/router/utils'
import type { SortOrder } from '@/api/interfaces/commons'
import { loadEventParticipations, loadEvents } from '@/api/utils/eventUtils'
import { useUserProfile } from '@/composables/useUserProfile'
import { useAuthStore } from '@/stores/auth'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  user: User
}

const props = defineProps<Props>()
const emit = defineEmits(['auth-required'])
const { t } = useTranslation('components.profile.ProfileBody')
const { hash, replaceRoute } = useNavigation()
const authStore = useAuthStore()
const { isOwnProfile, isOrganization } = useUserProfile(computed(() => props.user))
const defaultTab = computed(() => (isOrganization.value ? 'publishedEvents' : 'likes'))
const activeTab = ref<string>(defaultTab.value)

const setupRouteHash = () => {
  if (hash.value) {
    activeTab.value = hash.value.replace('#', '')
  } else {
    replaceRoute({ hash: `#${activeTab.value}` })
  }
}

onMounted(() => {
  setupRouteHash()
})

watch(
  () => hash.value,
  (newHash) => {
    if (newHash) {
      activeTab.value = newHash.replace('#', '')
    }
  }
)

watch(activeTab, (newTab) => {
  if (hash.value !== `#${newTab}`) {
    replaceRoute({ hash: `#${newTab}` })
  }
})

watch(
  () => props.user.id,
  () => {
    activeTab.value = defaultTab.value
    setupRouteHash()
  }
)

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = []

  if (isOrganization.value) {
    baseTabs.push({
      id: 'publishedEvents',
      label: t('myEventsExternal'),
      icon: 'event',
      component: EventsTab,
      props: {
        sections: [
          {
            key: 'PUBLISHED',
            options: { status: 'PUBLISHED', label: t('myEventsPublishedLabel'), sortOrder: 'asc' },
          },
          {
            key: 'COMPLETED',
            options: {
              status: 'COMPLETED',
              label: t('myEventsPastEventsLabel'),
              sortOrder: 'desc',
            },
          },
        ],
        loadEvents: (status: EventStatus, offset: number, limit: number, sortOrder: SortOrder) =>
          loadEvents({
            organizationId: props.user.id,
            userId: authStore.user?.id,
            status,
            sortOrder,
            pagination: { offset, limit },
          }),
        onAuthRequired: () => emit('auth-required'),
        emptyText: isOwnProfile.value ? t('noEventCreated') : t('noEventCreatedExternal'),
        emptyIconName: 'event_busy',
      },
    })
  }

  if (isOrganization.value && isOwnProfile.value) {
    baseTabs.push({
      id: 'drafted',
      label: t('draftedEvents'),
      icon: 'edit_note',
      component: EventsTab,
      props: {
        sections: [
          {
            key: 'DRAFT',
            options: { status: 'DRAFT', sortOrder: 'asc' },
          },
        ],
        loadEvents: (status: EventStatus, offset: number, limit: number, sortOrder: SortOrder) =>
          loadEvents({
            organizationId: props.user.id,
            userId: props.user.id,
            status,
            sortOrder,
            pagination: { offset, limit },
          }),
        onAuthRequired: () => emit('auth-required'),
        emptyText: t('noDraftedEvents'),
        emptyIconName: 'edit_note',
      },
    })
  }

  baseTabs.push({
    id: 'likes',
    label: t('myLikesExternal'),
    icon: 'favorite',
    component: MyLikesTab,
    props: {
      userId: props.user.id,
    },
  })

  baseTabs.push({
    id: 'events',
    label: t('myParticipationsExternal'),
    icon: 'event',
    component: EventsTab,
    props: {
      sections: [
        {
          key: 'PUBLISHED',
          options: {
            eventStatus: 'PUBLISHED',
            label: t('myParticipationsUpcomingLabel'),
            order: 'asc',
          },
        },
        {
          key: 'COMPLETED',
          options: {
            eventStatus: 'COMPLETED',
            label: t('myParticipationsPastLabel'),
            order: 'desc',
          },
        },
      ],
      loadEvents: (status: EventStatus, offset: number, limit: number, sortOrder: SortOrder) =>
        loadEventParticipations(props.user.id, authStore.user?.id, status, sortOrder, {
          offset,
          limit,
        }),
      onAuthRequired: () => emit('auth-required'),
      emptyText: isOwnProfile.value ? t('noEventJoined') : t('noEventJoinedExternal'),
      emptyIconName: 'event_busy',
    },
  })

  if (isOwnProfile.value) {
    baseTabs.push({
      id: 'tickets',
      label: t('myTickets'),
      icon: 'confirmation_number',
      component: TicketsTab,
    })
  }

  if (isOrganization.value) {
    baseTabs.push({
      id: 'reviews',
      label: t('reviews'),
      icon: 'star',
      component: ReviewsTab,
      props: {
        organizationId: props.user.id,
      },
    })
  }

  return baseTabs
})
</script>

<template>
  <TabView :key="user.id" v-model:activeTab="activeTab" :tabs="tabs" />
</template>
