<script setup lang="ts">
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import TicketsTab from './tabs/TicketsTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import ReviewsTab from './tabs/ReviewsTab.vue'
import type { User } from '@/api/types/users'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import type { Event, EventStatus } from '@/api/types/events'
import { useI18n } from 'vue-i18n'
import { useIsOwnProfile } from '@/composables/useProfile'

interface Props {
  user: User
}

const props = defineProps<Props>()
const { t } = useI18n()

const isOwnProfile = useIsOwnProfile(computed(() => props.user.id))
const isOrganization = computed(() => {
  return props.user.role === 'organization'
})

const organizationEvents = ref<Event[]>([])
const organizationDraftedEvents = ref<Event[]>([])
const memberAttendedEvents = ref<Event[]>([])

const hasMorePublished = ref(true)
const hasMoreDraft = ref(true)

const EVENTS_PER_PAGE = 5

const handleTabChange = (tabId: string) => {
  console.log('Tab attiva:', tabId)
}

onMounted(async () => {
  try {
    if (isOrganization.value) {
      const [publishedResponse, draftResponse] = await Promise.all([
        api.events.searchEvents({
          id_organization: props.user.id,
          status: 'PUBLISHED',
          pagination: { limit: EVENTS_PER_PAGE },
        }),
        api.events.searchEvents({
          id_organization: props.user.id,
          status: 'DRAFT',
          pagination: { limit: EVENTS_PER_PAGE },
        }),
      ])
      organizationEvents.value = publishedResponse.items
      organizationDraftedEvents.value = draftResponse.items
      hasMorePublished.value = publishedResponse.hasMore
      hasMoreDraft.value = draftResponse.hasMore
    } else {
      const publishedResponse = await api.events.searchEvents({
        id_organization: props.user.id,
        status: 'PUBLISHED',
        pagination: { limit: EVENTS_PER_PAGE },
      })
      organizationEvents.value = publishedResponse.items
      hasMorePublished.value = publishedResponse.hasMore
    }
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
        id_organization: props.user.id,
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

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = []

  if (!isOrganization.value && isOwnProfile.value) {
    baseTabs.push({
      id: 'tickets',
      label: t('userProfile.myTickets'),
      icon: 'confirmation_number',
      component: TicketsTab,
    })
  }

  baseTabs.push({
    id: 'events',
    label: isOwnProfile.value ? t('userProfile.myEvents') : t('userProfile.events'),
    icon: 'event',
    component: EventsTab,
    props: {
      events: isOrganization.value ? organizationEvents.value : memberAttendedEvents.value,
      hasMore: isOrganization.value ? hasMorePublished.value : false,
      onLoadMore: isOrganization.value ? loadMorePublished : undefined,
      emptyText: isOwnProfile.value
        ? isOrganization.value
          ? t('userProfile.noEventCreated')
          : t('userProfile.noEventJoined')
        : isOrganization.value
          ? t('userProfile.noEventCreatedExternal')
          : t('userProfile.noEventJoinedExternal'),
      emptyIconName: 'event_busy',
    },
  })

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
  <TabView :variant="'explore'" :tabs="tabs" @update:activeTab="handleTabChange" />
</template>
