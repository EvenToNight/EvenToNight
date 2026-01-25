<script setup lang="ts">
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import TicketsTab from './tabs/TicketsTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import ReviewsTab from './tabs/ReviewsTab.vue'
import MyLikesTab from './tabs/MyLikesTab.vue'
import type { User } from '@/api/types/users'
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '@/api'
import type { Event, EventStatus } from '@/api/types/events'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/router/utils'
import type { PaginatedResponseWithTotalCount } from '@/api/interfaces/commons'

interface Props {
  user: User
}

const props = defineProps<Props>()
const { t } = useI18n()
const authStore = useAuthStore()
const { hash, replaceRoute } = useNavigation()

const isOwnProfile = computed(() => authStore.isOwnProfile(props.user.id))
const isOrganization = computed(() => {
  return props.user.role === 'organization'
})

const organizationEvents = ref<Event[]>([])
const organizationDraftedEvents = ref<Event[]>([])
const userAttendedEvents = ref<Event[]>([])

const hasMorePublished = ref(true)
const hasMoreDraft = ref(true)
const hasMoreAttended = ref(true)

const EVENTS_PER_PAGE = 20

const activeTab = ref<string>(isOrganization.value ? 'publishedEvents' : 'likes')

onMounted(() => {
  if (hash.value) {
    activeTab.value = hash.value.replace('#', '')
  } else {
    replaceRoute({ hash: `#${activeTab.value}` })
  }
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

onMounted(async () => {
  try {
    const [publishedResponse, draftResponse] = await Promise.all([
      api.events.searchEvents({
        organizationId: props.user.id,
        status: 'PUBLISHED',
        pagination: { limit: EVENTS_PER_PAGE },
      }),
      api.events.searchEvents({
        organizationId: props.user.id,
        status: 'DRAFT',
        pagination: { limit: EVENTS_PER_PAGE },
      }),
    ])
    const response = await api.interactions.userParticipations(props.user.id, {
      pagination: {
        limit: EVENTS_PER_PAGE,
        offset: userAttendedEvents.value.length,
      },
    })
    const events: PaginatedResponseWithTotalCount<Event> = {
      ...response,
      items: await Promise.all(
        response.items.map((partecipation) => api.events.getEventById(partecipation.eventId))
      ),
    }
    userAttendedEvents.value = events.items
    hasMoreAttended.value = response.hasMore
    organizationEvents.value = publishedResponse.items
    organizationDraftedEvents.value = draftResponse.items
    hasMorePublished.value = publishedResponse.hasMore
    hasMoreDraft.value = draftResponse.hasMore
  } catch (error) {
    console.error('Failed to fetch data for user:', error)
  }
})

const createLoadMoreFunction = (
  eventsRef: typeof organizationEvents,
  hasMoreRef: typeof hasMorePublished,
  status: EventStatus
) => {
  return async () => {
    try {
      const response = await api.events.searchEvents({
        organizationId: props.user.id,
        status,
        pagination: {
          limit: EVENTS_PER_PAGE,
          offset: eventsRef.value.length,
        },
      })
      eventsRef.value.push(...response.items)
      hasMoreRef.value = response.hasMore
    } catch (error) {
      console.error(`Failed to load more ${status.toLowerCase()} events:`, error)
    }
  }
}

const loadMorePublished = createLoadMoreFunction(organizationEvents, hasMorePublished, 'PUBLISHED')
const loadMoreDraft = createLoadMoreFunction(organizationDraftedEvents, hasMoreDraft, 'DRAFT')
const loadMoreAttended = async () => {
  try {
    const response = await api.interactions.userParticipations(props.user.id, {
      pagination: {
        limit: EVENTS_PER_PAGE,
        offset: userAttendedEvents.value.length,
      },
    })
    console.log('Fetched more attended events:', response)
    const events: PaginatedResponseWithTotalCount<Event> = {
      ...response,
      items: await Promise.all(
        response.items.map((partecipation) => api.events.getEventById(partecipation.eventId))
      ),
    }
    userAttendedEvents.value.push(...events.items)
    hasMoreAttended.value = response.hasMore
  } catch (error) {
    console.error('Failed to load more attended events:', error)
  }
}

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = []

  if (isOrganization.value) {
    baseTabs.push({
      id: 'publishedEvents',
      label: t('userProfile.myEvents'),
      icon: 'event',
      component: EventsTab,
      props: {
        events: organizationEvents.value,
        hasMore: hasMorePublished.value,
        onLoadMore: loadMorePublished,
        emptyText: isOwnProfile.value
          ? t('userProfile.noEventCreated')
          : t('userProfile.noEventCreatedExternal'),
        emptyIconName: 'event_busy',
      },
    })
  }

  if (isOrganization.value && isOwnProfile.value) {
    baseTabs.push({
      id: 'drafted',
      label: t('userProfile.draftedEvents'),
      icon: 'edit_note',
      component: EventsTab,
      props: {
        events: organizationDraftedEvents.value,
        hasMore: hasMoreDraft.value,
        onLoadMore: loadMoreDraft,
        emptyText: t('userProfile.noDraftedEvents'),
        emptyIconName: 'edit_note',
      },
    })
  }
  baseTabs.push({
    id: 'likes',
    label: isOwnProfile.value ? 'My Likes' : 'Likes',
    icon: 'favorite',
    component: MyLikesTab,
  })

  if (!isOwnProfile.value) {
    baseTabs.push({
      id: 'events',
      label: 'Partecipations',
      icon: 'event',
      component: EventsTab,
      props: {
        events: userAttendedEvents.value,
        hasMore: hasMoreAttended.value,
        onLoadMore: loadMoreAttended,
        emptyText: t('userProfile.noEventJoinedExternal'),
        emptyIconName: 'event_busy',
      },
    })
  }

  if (isOwnProfile.value) {
    baseTabs.push({
      id: 'tickets',
      label: t('userProfile.myTickets'),
      icon: 'confirmation_number',
      component: TicketsTab,
    })
  }

  if (isOrganization.value) {
    baseTabs.push({
      id: 'reviews',
      label: t('userProfile.reviews'),
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
  <TabView v-model:activeTab="activeTab" :variant="'explore'" :tabs="tabs" />
</template>
