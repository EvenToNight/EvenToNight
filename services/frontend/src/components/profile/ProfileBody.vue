<script setup lang="ts">
import TabView, { type Tab } from '@/components/navigation/TabView.vue'
import TicketsTab from './tabs/TicketsTab.vue'
import EventsTab from './tabs/EventsTab.vue'
import type { User } from '@/api/types/users'
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useI18n } from 'vue-i18n'

interface Props {
  user: User
}

const props = defineProps<Props>()
const { t } = useI18n()
const authStore = useAuthStore()

const isOwnProfile = computed(() => {
  return authStore.isAuthenticated && authStore.user?.id === props.user.id
})
const isOrganization = computed(() => {
  return props.user.role === 'organization'
})

const organizationEvents = ref<Event[]>([])
const organizationDraftedEvents = ref<Event[]>([])
const memberAttendedEvents = ref<Event[]>([])

onMounted(async () => {
  try {
    const [publishedResponse, draftResponse] = await Promise.all([
      api.events.getEventsByUserIdAndStatus(props.user.id, 'PUBLISHED'),
      api.events.getEventsByUserIdAndStatus(props.user.id, 'DRAFT'),
    ])
    organizationEvents.value = publishedResponse.events
    organizationDraftedEvents.value = draftResponse.events
    //TODO fetch attended events for members
    memberAttendedEvents.value = []
  } catch (error) {
    console.error('Failed to fetch events for user:', error)
  }
})

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
        emptyText: t('userProfile.noDraftedEvents'),
        emptyIconName: 'edit_note',
      },
    })
  }

  return baseTabs
})
</script>

<template>
  <div class="profile-body">
    <TabView :tabs="tabs" />
  </div>
</template>

<style lang="scss" scoped>
.profile-body {
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-base;

  @include dark-mode {
    background: $color-background-dark;
  }
}
</style>
