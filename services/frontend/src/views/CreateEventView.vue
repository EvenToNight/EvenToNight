<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import ImageCropUploadTest from '@/components/upload/ImageCropUploadTest.vue'
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
import Button from '@/components/buttons/basicButtons/Button.vue'
import { useI18n } from 'vue-i18n'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { notEmpty, required } from '@/components/forms/validationUtils'
const { t } = useI18n()
const $q = useQuasar()

const { goToEventDetails, goToUserProfile, params } = useNavigation()
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

// Ticket types
interface TicketEntry {
  id: string | null
  type: TicketType | null
  price: string
  currency: string
  quantity: string
}

const CURRENCY_OPTIONS = [
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'GBP (£)', value: 'GBP' },
]

const availableTicketTypes = ref<TicketType[]>([])
const ticketEntries = ref<TicketEntry[]>([])

const createEmptyTicketEntry = (): TicketEntry => ({
  id: null,
  type: null,
  price: '',
  currency: 'EUR',
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

const loadTicketTypes = async () => {
  try {
    availableTicketTypes.value = await api.payments.getTicketTypes()
    if (availableTicketTypes.value.length > 0 && ticketEntries.value.length === 0) {
      ticketEntries.value.push(createEmptyTicketEntry())
    }
  } catch (error) {
    console.error('Failed to load ticket types:', error)
  }
}

const handleImageError = (message: string) => {
  $q.notify({
    color: 'negative',
    message,
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
    console.error('Failed to load tags:', error)
  }
}

const loadEvent = async () => {
  if (!eventId.value) return

  try {
    const event = await api.events.getEventById(eventId.value)
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
    console.error('Failed to load event:', error)
    $q.notify({
      color: 'negative',
      message: t('eventCreationForm.errorForEventLoad'),
    })
  }
}

onMounted(async () => {
  await Promise.all([loadTags(), loadTicketTypes()])
  if (isEditMode.value) {
    await loadEvent()
  }
})

watch(location, (newLocation) => {
  if (newLocation) {
    console.log('Location link:', newLocation.value.link)
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
    console.error('Error fetching locations:', err)
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

const handleDelete = async () => {
  $q.dialog({
    title: t('eventCreationForm.deleteEvent'),
    message: t('eventCreationForm.deleteEventConfirm'),
    cancel: {
      flat: true,
      textColor: 'black',
      label: t('eventCreationForm.cancel'),
    },
    ok: {
      color: 'negative',
      textColor: 'black',
      label: t('eventCreationForm.deleteEvent'),
    },
    focus: 'none',
  }).onOk(async () => {
    try {
      await api.events.deleteEvent(eventId.value)
      $q.notify({
        color: 'positive',
        message: t('eventCreationForm.successForEventDeletion'),
      })
      goToUserProfile(currentUserId!)
    } catch (error) {
      console.error('Failed to delete event:', error)
      $q.notify({
        color: 'negative',
        message: t('eventCreationForm.errorForEventDeletion'),
      })
    }
  })
}

const saveDraft = async () => {
  const partialEventData: PartialEventData = buildEventData('DRAFT')

  if (isEditMode.value) {
    await api.events.updateEventData(eventId.value, partialEventData)
    if (poster.value) {
      await api.events.updateEventPoster(eventId.value, poster.value)
    }
    await createOrUpdateEventTicketTypes()
    $q.notify({
      color: 'positive',
      message: t('eventCreationForm.successForEventUpdate'),
    })
  } else {
    await api.events.createEvent(partialEventData)
    await createOrUpdateEventTicketTypes()
    $q.notify({
      color: 'positive',
      message: t('eventCreationForm.successForEventPublication'),
    })
  }
  goToUserProfile(partialEventData.creatorId)
}

const createOrUpdateEventTicketTypes = async () => {
  ticketEntries.value.forEach(async (entry) => {
    if (entry.id === null) {
      await api.payments.createEventTicketType(eventId.value, {
        type: entry.type!,
        price: {
          amount: Number(entry.price),
          currency: entry.currency,
        },
        quantity: Number(entry.quantity),
      })
    } else {
      await api.payments.updateEventTicketType(entry.id, {
        type: entry.type!,
        price: {
          amount: Number(entry.price),
          currency: entry.currency,
        },
        quantity: Number(entry.quantity),
      })
    }
  })
}

const onSubmit = async () => {
  try {
    const partiaEventData: PartialEventData = buildEventData('PUBLISHED')
    if (isEditMode.value) {
      await api.events.updateEventData(eventId.value, partiaEventData)
      await api.events.updateEventPoster(eventId.value, poster.value!)
      await createOrUpdateEventTicketTypes()
      $q.notify({
        color: 'positive',
        message: t('eventCreationForm.successForEventUpdate'),
      })
      goToEventDetails(eventId.value)
    } else {
      const response = await api.events.createEvent(partiaEventData)
      await createOrUpdateEventTicketTypes()
      $q.notify({
        color: 'positive',
        message: t('eventCreationForm.successForEventPublication'),
      })
      goToEventDetails(response.eventId)
    }
  } catch (error) {
    console.error('Failed to save event:', error)
    $q.notify({
      color: 'negative',
      message: isEditMode.value
        ? t('eventCreationForm.errorForEventUpdate')
        : t('eventCreationForm.errorForEventPublication'),
    })
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="create-event-page">
    <div class="page-content">
      <div class="container">
        <h1 class="text-h3 q-mb-lg">
          {{
            isEditMode ? t('eventCreationForm.editEvent') : t('eventCreationForm.createNewEvent')
          }}
        </h1>

        <q-form class="form-container" greedy @submit.prevent="onSubmit">
          <FormField
            v-model="title"
            type="text"
            :label="t('eventCreationForm.eventTitle') + ' *'"
            :rules="[notEmpty(t('eventCreationForm.titleError'))]"
          />
          <FormField
            ref="dateInput"
            v-model="date"
            type="date"
            :label="t('eventCreationForm.date') + ' *'"
            :rules="[notEmpty(t('eventCreationForm.dateError'))]"
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
            :label="t('eventCreationForm.time') + ' *'"
            :rules="[notEmpty(t('eventCreationForm.timeError'))]"
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
            :label="t('eventCreationForm.description')"
            :rules="[notEmpty(t('eventCreationForm.descriptionError'))]"
            rows="4"
          />

          <!-- Ticket Types Section -->
          <div v-if="availableTicketTypes.length > 0" class="ticket-types-section q-my-md">
            <div class="text-subtitle1 q-mb-sm">Ticket Types</div>

            <div v-for="(entry, index) in ticketEntries" :key="index" class="ticket-entry-row">
              <q-select
                v-model="entry.type"
                :options="getAvailableTypesForEntry(index)"
                label="Type"
                outlined
                dense
                class="ticket-type-select"
                :rules="[notEmpty('Please select a ticket type')]"
              />

              <q-input
                v-model="entry.price"
                type="number"
                label="Price"
                outlined
                dense
                class="ticket-price-input"
                :rules="[notEmpty('Please enter a price')]"
              />

              <q-select
                v-model="entry.currency"
                :options="CURRENCY_OPTIONS"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Currency"
                outlined
                dense
                class="ticket-currency-select"
                :rules="[notEmpty('Please select a currency')]"
              />

              <q-input
                v-model="entry.quantity"
                type="number"
                label="Quantity"
                outlined
                dense
                class="ticket-quantity-input"
                :rules="[notEmpty('Please enter a quantity')]"
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
            :label="t('eventCreationForm.tags')"
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
            :label="t('eventCreationForm.collaborators')"
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
                      :alt="t('eventCreationForm.collaboratorAvatarAlt')"
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
            :label="t('eventCreationForm.location') + ' *'"
            use-input
            fill-input
            hide-selected
            clearable
            :rules="[required(t('eventCreationForm.locationError'))]"
            @filter="filterLocations"
            @input-value="handleLocationInputValue"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ t('eventCreationForm.locationNoOptionHint') }}
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
            :rules="[required(t('eventCreationForm.posterError'))]"
            lazy-rules="ondemand"
            hide-bottom-space
            borderless
            class="q-my-md"
          >
            <template #control>
              <ImageCropUploadTest
                v-model="poster"
                :label="t('eventCreationForm.eventPoster') + ' *'"
                :button-label="t('eventCreationForm.uploadPoster')"
                :max-size="5000000"
                @error="handleImageError"
              />
            </template>
          </q-field>
          <div class="form-actions">
            <div class="action-buttons">
              <Button
                variant="tertiary"
                :label="t('eventCreationForm.cancel')"
                @click="goToUserProfile(currentUserId!)"
              />
              <Button
                v-if="isEditMode"
                :label="t('eventCreationForm.deleteEvent')"
                color="negative"
                variant="tertiary"
                flat
                @click="handleDelete"
              />
            </div>
            <div class="action-buttons">
              <Button
                :label="t('eventCreationForm.saveDraft')"
                outline
                variant="primary"
                size="md"
                class="outline-btn-fix"
                @click="saveDraft"
              />
              <Button
                :label="
                  isEditMode
                    ? t('eventCreationForm.updateEvent')
                    : t('eventCreationForm.publishEvent')
                "
                variant="primary"
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
  //padding-top: calc(#{$spacing-4} + 40px + #{$spacing-4});
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
