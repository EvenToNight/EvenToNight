<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import PosterCropUpload from '@/components/imageUpload/PosterCropUpload.vue'
import { api } from '@/api'
import type { CreationEventStatus, PartialEventData } from '@/api/types/events'
import type { Location } from '@/api/types/common'
import { parseLocation, buildLocationDisplayName } from '@/api/utils/locationUtils'
import type { TicketType } from '@/api/types/payments'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import FormField from '@/components/forms/FormField.vue'
import FormSelectorField from '@/components/forms/FormSelectorField.vue'
import type { Tag } from '@/api/types/events'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { notEmpty, required } from '@/components/forms/validationUtils'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'
import { SERVER_ERROR_ROUTE_NAME } from '@/router'

const logger = createLogger(import.meta.url)
const { t } = useTranslation('views.CreateEventView')

const $q = useQuasar()

const { goToEventDetails, goToUserProfile, goToRoute, params } = useNavigation()
const authStore = useAuthStore()
const currentUserId = authStore.user?.id
const eventId = computed(() => params.id as string)
const isEditMode = computed(() => !!eventId.value)

interface LocationOption {
  label: string
  value: Location
  description: string
}

const title = ref('')
const date = ref('')
const time = ref('')
const description = ref('')
const tags = ref<string[]>([])
const collaborators = ref<string[]>([])
const location = ref<LocationOption | null>(null)
const poster = ref<File | null>(null)
const isDraft = ref(false)

interface TicketEntry {
  id: string | null
  type: TicketType | null
  price: string
  quantity: string
}

const availableTicketTypes = ref<TicketType[]>([])
const ticketEntries = ref<TicketEntry[]>([])

const createEmptyTicketEntry = (): TicketEntry => ({
  id: null,
  type: null,
  price: '',
  quantity: '',
})

const getAvailableTypesForEntry = (currentIndex: number): TicketType[] => {
  const usedTypes = ticketEntries.value
    .filter((_, idx) => idx !== currentIndex)
    .map((entry) => entry.type)
    .filter((type): type is TicketType => type !== null)
  return availableTicketTypes.value.filter((type) => !usedTypes.includes(type))
}

const canAddMoreTickets = computed(() => {
  return ticketEntries.value.length < availableTicketTypes.value.length
})

const addTicketEntry = () => {
  if (canAddMoreTickets.value) {
    ticketEntries.value.push(createEmptyTicketEntry())
  }
}

const removeTicketEntry = (index: number) => {
  ticketEntries.value.splice(index, 1)
}

const handleImageError = (message: string) => {
  logger.error('Poster image upload error:', message)
  $q.notify({
    color: 'negative',
    message: t('form.messages.errors.imageUpload'),
  })
}

const tagCategories = ref<any[]>([])
const tagOptions = ref<any[]>([])
const allTags = ref<string[]>([])
const collaboratorOptions = ref<any[]>([])
const locationOptions = ref<any[]>()

const buildOptionsFromCategories = (category: string, tags: Tag[]) => {
  const options: any[] = []

  options.push({
    label: category,
    value: category,
    disable: true,
    header: true,
  })
  tags.forEach((tag: string) => {
    options.push({
      label: tag,
      value: tag,
    })
  })

  return options
}

watch(location, (newLocation) => {
  if (newLocation) {
    logger.log('Location link:', newLocation.value.link)
  }
})

const filterTags = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      tagOptions.value = tagCategories.value.flatMap((cat) =>
        buildOptionsFromCategories(cat.category, cat.tags)
      )
    } else {
      const query = val.toLowerCase()
      const options: any[] = []

      tagCategories.value.forEach((tagCategory) => {
        const matchingTags = tagCategory.tags.filter(
          (tag: string) => tag.toLowerCase().indexOf(query) > -1
        )

        if (matchingTags.length > 0) {
          options.push(...buildOptionsFromCategories(tagCategory.category, matchingTags))
        }
      })
      tagOptions.value = options
    }
  })
}

const filterCollaborators = (query: string, update: (fn: () => void) => void) => {
  const mapCollaborator = (org: any) => ({
    label: org.name,
    value: org.id,
    avatar: org.avatarUrl || undefined,
  })
  if (!query) {
    update(() => {
      collaboratorOptions.value = []
    })
    return
  }
  api.users.searchUsers({ prefix: query, pagination: { limit: 10 } }).then((response) => {
    update(() => {
      collaboratorOptions.value = response.items.map(mapCollaborator)
    })
  })
}

const filterLocations = async (val: string, update: (fn: () => void) => void) => {
  if (val.length < 3) {
    update(() => {
      locationOptions.value = []
    })
    return
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`
    )
    const data = await response.json()
    update(() => {
      locationOptions.value = data.flatMap((item: any) => {
        try {
          const [displayName, locationData] = parseLocation(item)
          return [
            {
              label: displayName,
              value: locationData,
              description: item.type,
            },
          ]
        } catch {
          return []
        }
      })
    })
  } catch (err) {
    logger.error('Error fetching locations:', err)
    $q.notify({
      color: 'negative',
      message: t('form.messages.errors.fetchLocations'),
    })
    update(() => {
      locationOptions.value = []
    })
  }
}

const handleLocationInputValue = (val: string) => {
  if (!val || val.trim() === '') {
    location.value = null
  }
}

const handleDelete = async () => {
  $q.dialog({
    title: t('form.dialog.delete.title'),
    message: t('form.dialog.delete.message'),
    cancel: {
      flat: true,
      textColor: 'black',
      label: t('form.dialog.delete.cancelButton'),
    },
    ok: {
      color: 'negative',
      textColor: 'black',
      label: t('form.dialog.delete.confirmButton'),
    },
    focus: 'none',
  }).onOk(async () => {
    try {
      await api.events.deleteEvent(eventId.value)
      $q.notify({
        color: 'positive',
        message: t('form.messages.success.deleteEvent'),
      })
      goToUserProfile(currentUserId!)
    } catch (error) {
      logger.error('Failed to delete event:', error)
      $q.notify({
        color: 'negative',
        message: t('form.messages.errors.deleteEvent'),
      })
    }
  })
}

const createOrUpdateEventTicketTypes = async (eventId: string) => {
  ticketEntries.value.forEach(async (entry) => {
    if (entry.id === null) {
      await api.payments.createEventTicketType(eventId, {
        type: entry.type!,
        price: Number(entry.price),
        quantity: Number(entry.quantity),
      })
    } else {
      await api.payments.updateEventTicketType(entry.id, {
        price: Number(entry.price),
        quantity: Number(entry.quantity),
      })
    }
  })
}

const buildEventData = (status: CreationEventStatus): PartialEventData => {
  return {
    title: title.value || undefined,
    description: description.value || undefined,
    poster: poster.value || undefined,
    tags: tags.value.length > 0 ? tags.value : undefined,
    location: location.value?.value || undefined,
    date: date.value && time.value ? new Date(`${date.value}T${time.value}`) : undefined,
    status: status,
    creatorId: currentUserId!,
    collaboratorIds: collaborators.value.length > 0 ? collaborators.value : undefined,
  }
}

const saveDraft = async () => {
  try {
    const partialEventData: PartialEventData = buildEventData('DRAFT')

    if (isEditMode.value) {
      await api.events.updateEventData(eventId.value, partialEventData)
      if (poster.value) {
        await api.events.updateEventPoster(eventId.value, poster.value)
      } else {
        await api.events.deleteEventPoster(eventId.value)
      }
      await createOrUpdateEventTicketTypes(eventId.value)
      $q.notify({
        color: 'positive',
        message: t('form.messages.success.updateEventDraft'),
      })
    } else {
      const response = await api.events.createEvent(partialEventData)
      await createOrUpdateEventTicketTypes(response.eventId)
      $q.notify({
        color: 'positive',
        message: t('form.messages.success.saveEventDraft'),
      })
    }
    goToUserProfile(partialEventData.creatorId)
  } catch (error) {
    logger.error('Failed to save draft:', error)
    $q.notify({
      color: 'negative',
      message: isEditMode.value
        ? t('form.messages.errors.updateEventDraft')
        : t('form.messages.errors.saveEventDraft'),
    })
    goToRoute(SERVER_ERROR_ROUTE_NAME)
  }
}

const onSubmit = async () => {
  try {
    const partiaEventData: PartialEventData = buildEventData('PUBLISHED')
    if (isEditMode.value) {
      await api.events.updateEventData(eventId.value, partiaEventData)
      await api.events.updateEventPoster(eventId.value, poster.value!)
      await createOrUpdateEventTicketTypes(eventId.value)
      $q.notify({
        color: 'positive',
        message: t('form.messages.success.updateEvent'),
      })
      goToEventDetails(eventId.value)
    } else {
      const response = await api.events.createEvent(partiaEventData)
      await createOrUpdateEventTicketTypes(response.eventId)
      $q.notify({
        color: 'positive',
        message: t('form.messages.success.saveEvent'),
      })
      goToEventDetails(response.eventId)
    }
  } catch (error) {
    logger.error('Failed to save event:', error)
    $q.notify({
      color: 'negative',
      message: isEditMode.value
        ? t('form.messages.errors.updateEvent')
        : t('form.messages.errors.saveEvent'),
    })
    goToRoute(SERVER_ERROR_ROUTE_NAME)
  }
}

const loadTickets = async () => {
  try {
    const ticketTypes = await api.payments.getEventTicketsType(eventId.value)
    ticketEntries.value = ticketTypes.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      price: ticket.price.toString(),
      quantity: ticket.totalQuantity.toString(),
    }))
    if (ticketEntries.value.length === 0) {
      addTicketEntry()
    }
  } catch (error) {
    logger.error('Failed to load event tickets:', error)
    throw error
  }
}

const loadEvent = async () => {
  if (!eventId.value) return

  try {
    const event = await api.events.getEventById(eventId.value)
    isDraft.value = event.status === 'DRAFT'
    title.value = event.title ?? ''
    if (event.date) {
      const eventDate = new Date(event.date)
      const isoDate = eventDate.toISOString().split('T')[0] // YYYY-MM-DD
      date.value = isoDate || ''
      time.value = eventDate.toTimeString().slice(0, 5) // HH:mm
    }
    description.value = event.description ?? ''
    tags.value = event.tags ?? []
    collaborators.value = event.collaboratorIds ?? []
    if (event.location) {
      location.value = {
        label: buildLocationDisplayName(event.location),
        value: event.location,
        description: '',
      }
    }
    poster.value = (await api.media.get(event.poster!)).file
  } catch (error) {
    logger.error('Failed to load event:', error)
    throw error
  }
}

const loadTicketTypes = async () => {
  try {
    availableTicketTypes.value = await api.payments.getTicketTypes()
    if (availableTicketTypes.value.length > 0 && ticketEntries.value.length === 0) {
      ticketEntries.value.push(createEmptyTicketEntry())
    }
  } catch (error) {
    logger.error('Failed to load ticket types:', error)
    throw error
  }
}

const loadTags = async () => {
  try {
    const tagResponse = await api.events.getTags()
    const options: any[] = []
    tagResponse.forEach((tagCategory) => {
      options.push(...buildOptionsFromCategories(tagCategory.category, tagCategory.tags))
    })
    allTags.value = tagResponse.flatMap((tagCategory) => tagCategory.tags)
    tagOptions.value = options
    tagCategories.value = tagResponse
  } catch (error) {
    logger.error('Failed to load tags:', error)
    throw error
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadTags(), loadTicketTypes()])
    if (isEditMode.value) {
      await Promise.all([loadEvent(), loadTickets()])
    }
  } catch (error) {
    logger.error('Error during initialization:', error)
    $q.notify({
      color: 'negative',
      message: isEditMode.value ? t('messages.errors.loadEvent') : t('messages.errors.createEvent'),
    })
    goToRoute(SERVER_ERROR_ROUTE_NAME)
  }
})
</script>

<template>
  <NavigationButtons />

  <div class="create-event-page">
    <div class="page-content">
      <div class="container">
        <h1 class="text-h3 q-mb-lg">
          {{ isEditMode ? t('title.edit') : t('title.new') }}
        </h1>

        <q-form class="form-container" greedy @submit.prevent="onSubmit">
          <FormField
            v-model="title"
            type="text"
            :label="t('form.title.label') + ' *'"
            :rules="[notEmpty(t('form.title.error'))]"
          />
          <FormField
            ref="dateInput"
            v-model="date"
            type="date"
            :label="t('form.date.label') + ' *'"
            :rules="[notEmpty(t('form.date.error'))]"
          >
            <template #prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click="($refs.dateInput as any).$el.querySelector('input').showPicker()"
              />
            </template>
          </FormField>

          <FormField
            ref="timeInput"
            v-model="time"
            type="time"
            :label="t('form.time.label') + ' *'"
            :rules="[notEmpty(t('form.time.error'))]"
          >
            <template #prepend>
              <q-icon
                name="access_time"
                class="cursor-pointer"
                @click="($refs.timeInput as any).$el.querySelector('input').showPicker()"
              />
            </template>
          </FormField>

          <FormField
            v-model="description"
            type="textarea"
            :label="t('form.description.label')"
            :rules="[notEmpty(t('form.description.error'))]"
            rows="4"
          />

          <div v-if="availableTicketTypes.length > 0" class="ticket-types-section q-my-md">
            <div class="text-subtitle1 q-mb-sm">{{ t('form.ticketTypes.sectionTitle') }}</div>

            <div v-for="(entry, index) in ticketEntries" :key="index" class="ticket-entry-row">
              <q-select
                v-model="entry.type"
                :options="getAvailableTypesForEntry(index)"
                :label="t('form.ticketTypes.type.label') + ' *'"
                outlined
                dense
                lazy-rules="ondemand"
                class="ticket-type-select"
                :rules="[notEmpty(t('form.ticketTypes.type.error'))]"
              />

              <q-input
                v-model="entry.price"
                type="number"
                :label="t('form.ticketTypes.price.label') + ' ($)*'"
                prefix="$"
                outlined
                dense
                lazy-rules="ondemand"
                class="ticket-price-input"
                :rules="[notEmpty(t('form.ticketTypes.price.error'))]"
              />

              <q-input
                v-model="entry.quantity"
                type="number"
                :label="t('form.ticketTypes.quantity.label') + ' *'"
                outlined
                dense
                lazy-rules="ondemand"
                class="ticket-quantity-input"
                :rules="[notEmpty(t('form.ticketTypes.quantity.error'))]"
              />

              <q-btn
                v-if="ticketEntries.length > 1"
                flat
                round
                dense
                icon="delete"
                color="negative"
                class="delete-ticket-btn"
                @click="removeTicketEntry(index)"
              />
            </div>

            <div v-if="canAddMoreTickets" class="add-ticket-btn-container">
              <q-btn flat round icon="add" color="primary" @click="addTicketEntry" />
            </div>
          </div>

          <FormSelectorField
            v-model="tags"
            :options="tagOptions"
            :label="t('form.tags.label')"
            multiple
            use-chips
            use-input
            emit-value
            map-options
            option-value="value"
            option-label="label"
            @filter="filterTags"
            ><template #option="scope">
              <q-item v-if="scope.opt.header" class="category-header" :disable="scope.opt.disable">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-else v-bind="scope.itemProps" :class="{ 'selected-tag': scope.selected }">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section v-if="scope.selected" side>
                  <q-icon name="check" color="primary" />
                </q-item-section>
              </q-item>
            </template>
          </FormSelectorField>

          <FormSelectorField
            v-model="collaborators"
            :options="collaboratorOptions"
            :label="t('form.collaborators.label')"
            multiple
            use-chips
            use-input
            emit-value
            map-options
            option-value="value"
            option-label="label"
            @filter="filterCollaborators"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps" :class="{ 'selected-tag': scope.selected }">
                <q-item-section v-if="scope.opt.avatar" avatar>
                  <q-avatar size="32px" class="collaborator-avatar" rounded>
                    <img
                      :src="scope.opt.avatar"
                      :alt="t('form.collaborators.avatarAlt')"
                      style="object-fit: cover; width: 100%; height: 100%; border-radius: 50%"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section v-if="scope.selected" side>
                  <q-icon name="check" color="primary" />
                </q-item-section>
              </q-item>
            </template>
          </FormSelectorField>

          <FormSelectorField
            v-model="location"
            :options="locationOptions"
            :label="t('form.location.label') + ' *'"
            use-input
            fill-input
            hide-selected
            clearable
            :rules="[required(t('form.location.error'))]"
            @filter="filterLocations"
            @input-value="handleLocationInputValue"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ t('form.location.noOptionHint') }}
                </q-item-section>
              </q-item>
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </FormSelectorField>

          <q-field
            :model-value="poster"
            :rules="[required(t('form.poster.error'))]"
            lazy-rules="ondemand"
            hide-bottom-space
            borderless
            class="q-my-md"
          >
            <template #control>
              <PosterCropUpload
                v-model="poster"
                :label="t('form.poster.label') + ' *'"
                :button-label="t('form.poster.uploadButtonLabel')"
                :max-size="5000000"
                @error="handleImageError"
              />
            </template>
          </q-field>
          <div class="form-actions">
            <div class="action-buttons">
              <q-btn
                flat
                :label="t('form.cancel')"
                class="base-button base-button--tertiary"
                @click="goToUserProfile(currentUserId!)"
              />
              <q-btn
                v-if="isEditMode"
                :label="t('form.actions.delete')"
                color="negative"
                flat
                @click="handleDelete"
              />
            </div>
            <div class="action-buttons">
              <q-btn
                v-if="!isEditMode || isDraft"
                :label="isEditMode ? t('form.actions.updateDraft') : t('form.actions.saveDraft')"
                outline
                unelevated
                color="primary"
                size="md"
                class="base-button base-button--primary outline-btn-fix"
                @click="saveDraft"
              />
              <q-btn
                :label="
                  isDraft
                    ? t('form.actions.publishEvent')
                    : isEditMode
                      ? t('form.actions.updatePublishedEvent')
                      : t('form.actions.publishEvent')
                "
                unelevated
                color="primary"
                class="base-button base-button--primary"
                type="submit"
              />
            </div>
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-event-page {
  @include flex-column;
  min-height: 100vh;
  position: relative;
  padding-top: $spacing-6;
}

.collaborator-avatar {
  @include flex-center;
  overflow: hidden;
  background: transparent;
}

.page-content {
  flex: 1;
  padding: $spacing-8 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}

.form-container {
  background: $color-background;
  padding: $spacing-6;
  border-radius: $radius-xl;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: #1e1e1e;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  :deep(input[type='date']::-webkit-calendar-picker-indicator),
  :deep(input[type='time']::-webkit-calendar-picker-indicator) {
    display: none;
  }

  :deep(input[type='date']),
  :deep(input[type='time']) {
    color-scheme: light;

    @include dark-mode {
      color-scheme: dark;
    }
  }
}

.error-message {
  color: $color-error;
  font-size: $font-size-xs;
  padding: 8px 12px 0;
  line-height: 1;

  @include dark-mode {
    color: $color-error-dark;
  }
}

.form-actions {
  @include flex-between;
  margin-top: $spacing-8;
  padding-top: $spacing-6;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    gap: $spacing-4;
    align-items: stretch;
  }
}

.action-buttons {
  display: flex;
  gap: $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    width: 100%;
  }
}

.ticket-types-section {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: $radius-md;
  padding: $spacing-4;

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.ticket-entry-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    flex-wrap: wrap;
  }
}

.ticket-type-select {
  flex: 2;
  min-width: 120px;
}

.ticket-price-input {
  flex: 1;
  min-width: 80px;
}

.ticket-currency-select {
  flex: 1;
  min-width: 100px;
}

.ticket-quantity-input {
  flex: 1;
  min-width: 80px;
}

.delete-ticket-btn {
  flex-shrink: 0;
}

.add-ticket-btn-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-2;
}
</style>
