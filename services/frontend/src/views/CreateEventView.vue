<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import ImageCropUploadTest from '@/components/upload/ImageCropUploadTest.vue'
import { api } from '@/api'
import type { CreationEventStatus, PartialEventData } from '@/api/types/events'
import type { Location } from '@/api/types/common'
import { parseLocation, buildLocationDisplayName } from '@/api/utils'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import FormField from '@/components/forms/FormField.vue'
import FormSelectorField from '@/components/forms/FormSelectorField.vue'
import type { Tag } from '@/api/types/events'
import Button from '@/components/buttons/basicButtons/Button.vue'
import { useI18n } from 'vue-i18n'
import { validateLocation } from '@/api/utils'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'

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
const price = ref('')
const tags = ref<string[]>([])
const collaborators = ref<string[]>([])
const location = ref<LocationOption | null>(null)
const poster = ref<File | null>(null)

const titleError = ref('')
const dateError = ref('')
const timeError = ref('')
const descriptionError = ref('')
const priceError = ref('')
const locationError = ref('')
const posterError = ref('')

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
    console.log(event.date)
    if (event.date) {
      const eventDate = new Date(event.date)
      const isoDate = eventDate.toISOString().split('T')[0] // YYYY-MM-DD
      date.value = isoDate || ''
      time.value = eventDate.toTimeString().slice(0, 5) // HH:mm
    }
    description.value = event.description ?? ''
    price.value = String(event.price ?? '')
    tags.value = event.tags ?? []
    collaborators.value = event.id_collaborators ?? []
    console.log(event.location)
    if (validateLocation(event.location)) {
      console.log('Valid location:', event.location)
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
  await loadTags()
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

const filterCollaborators = (val: string, update: (fn: () => void) => void) => {
  const mapCollaborator = (org: any) => ({
    label: org.name,
    value: org.id,
    avatar: org.avatarUrl || undefined,
  })
  if (!val) {
    update(() => {
      collaboratorOptions.value = []
    })
    return
  }
  api.users.getOrganizations(val, { limit: 10 }).then((response) => {
    update(() => {
      collaboratorOptions.value = response.users.map(mapCollaborator)
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
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'EvenToNight',
        },
      }
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

const validateInput = (): boolean => {
  let isValid = true
  titleError.value = ''
  dateError.value = ''
  timeError.value = ''
  descriptionError.value = ''
  priceError.value = ''
  locationError.value = ''
  posterError.value = ''

  if (!title.value) {
    titleError.value = t('eventCreationForm.titleError')
    isValid = false
  }

  if (!date.value) {
    dateError.value = t('eventCreationForm.dateError')
    isValid = false
  }

  if (!time.value) {
    timeError.value = t('eventCreationForm.timeError')
    isValid = false
  }

  if (!description.value) {
    descriptionError.value = t('eventCreationForm.descriptionError')
    isValid = false
  }

  if (!price.value) {
    priceError.value = t('eventCreationForm.priceError')
    isValid = false
  }

  if (!location.value?.value) {
    locationError.value = t('eventCreationForm.locationError')
    isValid = false
  }

  if (!poster.value) {
    posterError.value = t('eventCreationForm.posterError')
    isValid = false
  }
  return isValid
}

const saveDraft = async () => {
  const eventData: PartialEventData = buildEventData('DRAFT')
  if (isEditMode.value) {
    await api.events.updateEventData(eventId.value, eventData)
    if (poster.value) {
      await api.events.updateEventPoster(eventId.value, poster.value)
    }
    $q.notify({
      color: 'positive',
      message: t('eventCreationForm.successForEventUpdate'),
    })
  } else {
    await api.events.publishEvent(eventData)
    $q.notify({
      color: 'positive',
      message: t('eventCreationForm.successForEventPublication'),
    })
  }
  goToUserProfile(eventData.id_creator)
}

const buildEventData = (status: CreationEventStatus): PartialEventData => {
  const dateTime = date.value && time.value ? new Date(`${date.value}T${time.value}`) : undefined

  return {
    title: title.value,
    description: description.value,
    poster: poster.value!,
    tags: tags.value,
    location: location.value?.value,
    date: dateTime,
    price: Number(price.value),
    status: status,
    id_creator: currentUserId!,
    id_collaborators: collaborators.value,
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
    persistent: true,
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

const onSubmit = async () => {
  const isValid = validateInput()
  if (!isValid) {
    $q.notify({
      color: 'negative',
      message: t('eventCreationForm.errorForEventCreation'),
    })
    return
  }
  try {
    const eventData: PartialEventData = buildEventData('PUBLISHED')
    if (isEditMode.value) {
      await api.events.updateEventData(eventId.value, eventData)
      await api.events.updateEventPoster(eventId.value, poster.value!)
      $q.notify({
        color: 'positive',
        message: t('eventCreationForm.successForEventUpdate'),
      })
      goToEventDetails(eventId.value)
    } else {
      const response = await api.events.publishEvent(eventData)
      $q.notify({
        color: 'positive',
        message: t('eventCreationForm.successForEventPublication'),
      })
      goToEventDetails(response.id_event)
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

        <q-form class="form-container" @submit="onSubmit">
          <FormField
            v-model="title"
            type="text"
            :label="t('eventCreationForm.eventTitle') + ' *'"
            :error="titleError"
          />
          <FormField
            ref="dateInput"
            v-model="date"
            type="date"
            :label="t('eventCreationForm.date') + ' *'"
            :error="dateError"
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
            :error="timeError"
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
            :error="descriptionError"
            rows="4"
          />

          <FormField
            v-model="price"
            type="number"
            :label="t('eventCreationForm.price') + ' (€)'"
            :error="priceError"
            prefix="€"
          />

          <FormSelectorField
            v-model="tags"
            :options="tagOptions"
            :label="t('eventCreationForm.tags')"
            multiple
            use-chips
            use-input
            input-debounce="300"
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
            input-debounce="300"
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
            input-debounce="500"
            :error="locationError"
            @filter="filterLocations"
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

          <div>
            <ImageCropUploadTest
              v-model="poster"
              :label="t('eventCreationForm.eventPoster') + ' *'"
              :button-label="t('eventCreationForm.uploadPoster')"
              :max-size="5000000"
              @error="handleImageError"
            />
            <div v-if="posterError" class="error-message">
              {{ posterError }}
            </div>
          </div>
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
  padding-top: calc(#{$spacing-4} + 40px + #{$spacing-4});
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
</style>
