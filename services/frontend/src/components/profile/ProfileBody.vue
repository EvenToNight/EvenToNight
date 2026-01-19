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
const memberAttendedEvents = ref<Event[]>([])

const hasMorePublished = ref(true)
const hasMoreDraft = ref(true)

const EVENTS_PER_PAGE = 5

const activeTab = ref<string>('events')

onMounted(() => {
  if (hash.value) {
    activeTab.value = hash.value.replace('#', '')
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

const tabs = computed<Tab[]>(() => {
  const baseTabs: Tab[] = []

  baseTabs.push({
    id: 'likes',
    label: isOwnProfile.value ? 'My Likes' : 'Likes',
    icon: 'favorite',
    component: MyLikesTab,
  })

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

  if (!isOrganization.value && isOwnProfile.value) {
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
  <TabView v-model="activeTab" :variant="'explore'" :tabs="tabs" />
</template>
