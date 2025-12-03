<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import BackButton from '@/components/navigation/BackButton.vue'
import ImageCropUpload from '@/components/upload/ImageCropUpload.vue'
import { api } from '@/api'
import type { EventData } from '@/api/types/events'
import type { Location } from '@/api/types/common'
import { parseLocation } from '@/api/types/common'
const $q = useQuasar()
const router = useRouter()

// Mock current user ID - in real app would come from auth
const currentUserId = 'current-user-id'

const event = ref({
  title: '',
  date: '',
  time: '',
  description: '',
  price: 0,
  tags: [] as string[],
  collaborators: [] as string[],
  location: null as Location | null,
  poster: null as File | null,
  status: 'draft' as 'draft' | 'published',
})

// Error states for validation
const errors = ref({
  title: '',
  date: '',
  time: '',
  location: '',
  poster: '',
})

const handleImageError = (message: string) => {
  $q.notify({
    color: 'negative',
    message,
  })
}

const tagOptions = ref<any[]>([])
const allTags = ref<string[]>([])
const tagCategories = ref<any[]>([])
const collaboratorOptions = ref<any[]>([])
const locationOptions = ref<any[]>([])

// Load tags from API
const loadTags = async () => {
  try {
    const categories = await api.events.getTags()
    tagCategories.value = categories

    // Create options with category headers
    const options: any[] = []
    categories.forEach((category) => {
      // Add category header (non-selectable)
      options.push({
        label: category.category,
        value: category.category,
        disable: true,
        header: true,
      })
      // Add tags from this category
      category.tags.forEach((tag: string) => {
        options.push({
          label: tag,
          value: tag,
        })
      })
    })

    // Also keep flat array for filtering
    const tags = categories.flatMap((category) => category.tags)
    allTags.value = tags
    tagOptions.value = options
  } catch (error) {
    console.error('Failed to load tags:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to load tags',
    })
  }
}

// Load tags on component mount
loadTags()

// Mock organizations for search
const allOrganizations = [
  { label: 'Cocoricò', value: 1 },
  { label: 'Baia Imperiale', value: 2 },
  { label: 'Altromondo Studios', value: 3 },
  { label: 'Peter Pan', value: 4 },
  { label: 'Villa delle Rose', value: 5 },
]

const filterTags = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      // Show all tags with category headers
      const options: any[] = []
      tagCategories.value.forEach((category) => {
        options.push({
          label: category.category,
          value: category.category,
          disable: true,
          header: true,
        })
        category.tags.forEach((tag: string) => {
          options.push({
            label: tag,
            value: tag,
          })
        })
      })
      tagOptions.value = options
    } else {
      // Filter tags but keep category headers for matching tags
      const needle = val.toLowerCase()
      const options: any[] = []

      tagCategories.value.forEach((category) => {
        const matchingTags = category.tags.filter(
          (tag: string) => tag.toLowerCase().indexOf(needle) > -1
        )

        if (matchingTags.length > 0) {
          // Add category header only if there are matching tags
          options.push({
            label: category.category,
            value: category.category,
            disable: true,
            header: true,
          })
          matchingTags.forEach((tag: string) => {
            options.push({
              label: tag,
              value: tag,
            })
          })
        }
      })

      tagOptions.value = options
    }
  })
}

const filterCollaborators = (val: string, update: (fn: () => void) => void) => {
  if (val === '') {
    update(() => {
      collaboratorOptions.value = allOrganizations
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    collaboratorOptions.value = allOrganizations.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    )
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
    console.log(data)

    update(() => {
      locationOptions.value = data
        .map((item: any) => {
          try {
            const [displayName, locationData] = parseLocation(item)
            return {
              label: displayName,
              value: locationData,
              description: item.type,
            }
          } catch (error) {
            console.warn('Skipping invalid location:', error)
            return null
          }
        })
        .filter((option: any) => option !== null)
    })
  } catch (err) {
    console.error('Error fetching locations:', err)
    update(() => {
      locationOptions.value = []
    })
  }
}

const handleLocationSelect = (location: any) => {
  event.value.location = location
  if (location) {
    console.log('Location selected:', location.value.link)
    // Clear any previous location error
    errors.value.location = ''
  }
}

const saveDraft = async () => {
  if (!event.value.title) {
    $q.notify({
      color: 'negative',
      message: 'Please provide at least a title for the draft',
    })
    return
  }

  try {
    event.value.status = 'draft'

    // For draft, we only need title and basic info
    const dateTime =
      event.value.date && event.value.time
        ? new Date(`${event.value.date}T${event.value.time}`)
        : new Date()

    const eventData: EventData = {
      title: event.value.title,
      description: event.value.description,
      poster: event.value.poster || new File([], 'placeholder.jpg'),
      tags: event.value.tags,
      location: event.value.location || {
        country: '',
        countryCode: '',
        state: '',
        province: '',
        city: '',
        road: '',
        postcode: 0,
        house_number: 0,
        lat: 0,
        lon: 0,
        link: '',
      },
      date: dateTime,
      price: event.value.price,
      status: 'draft',
      creatorId: currentUserId,
      collaboratorsId: event.value.collaborators,
    }

    await api.events.publishEvent(eventData)

    $q.notify({
      color: 'positive',
      message: 'Draft saved successfully!',
    })

    router.push({ name: 'home' })
  } catch (error) {
    console.error('Failed to save draft:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to save draft. Please try again.',
    })
  }
}

const onSubmit = async () => {
  // Reset errors
  errors.value = {
    title: '',
    date: '',
    time: '',
    location: '',
    poster: '',
  }

  // Validate required fields
  let hasErrors = false

  if (!event.value.title) {
    errors.value.title = 'Event Title is required'
    hasErrors = true
  }

  if (!event.value.date) {
    errors.value.date = 'Date is required'
    hasErrors = true
  }

  if (!event.value.time) {
    errors.value.time = 'Time is required'
    hasErrors = true
  }

  if (!event.value.location) {
    errors.value.location = 'Location is required'
    hasErrors = true
  }

  if (!event.value.poster) {
    errors.value.poster = 'Event Poster is required'
    hasErrors = true
  }

  if (hasErrors) {
    $q.notify({
      color: 'negative',
      message: 'Please fill all required fields',
    })
    return
  }

  try {
    event.value.status = 'published'

    // Combine date and time into a Date object
    const dateTime = new Date(`${event.value.date}T${event.value.time}`)

    // Create EventData object
    const eventData: EventData = {
      title: event.value.title,
      description: event.value.description,
      poster: event.value.poster,
      tags: event.value.tags,
      location: event.value.location,
      date: dateTime,
      price: event.value.price,
      status: 'published',
      creatorId: currentUserId,
      collaboratorsId: event.value.collaborators,
    }

    // Call API to publish event
    const response = await api.events.publishEvent(eventData)

    $q.notify({
      color: 'positive',
      message: 'Event published successfully!',
    })

    // Navigate to the created event
    router.push({ name: 'event-details', params: { id: response.eventId } })
  } catch (error) {
    console.error('Failed to create event:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to create event. Please try again.',
    })
  }
}
</script>

<template>
  <div class="create-event-page">
    <BackButton />

    <div class="page-content">
      <div class="container">
        <h1 class="text-h3 q-mb-lg">Create New Event</h1>

        <q-form class="form-container" @submit="onSubmit">
          <div class="form-field">
            <q-input
              v-model="event.title"
              label="Event Title *"
              outlined
              hide-bottom-space
              :error="!!errors.title"
              :error-message="errors.title"
            />
          </div>

          <div class="form-field">
            <q-input
              ref="dateInput"
              v-model="event.date"
              type="date"
              label="Date *"
              outlined
              hide-bottom-space
              :error="!!errors.date"
              :error-message="errors.date"
            >
              <template #prepend>
                <q-icon
                  name="event"
                  class="cursor-pointer"
                  @click="($refs.dateInput as any).$el.querySelector('input').showPicker()"
                />
              </template>
            </q-input>
          </div>

          <div class="form-field">
            <q-input
              ref="timeInput"
              v-model="event.time"
              type="time"
              label="Time *"
              outlined
              hide-bottom-space
              :error="!!errors.time"
              :error-message="errors.time"
            >
              <template #prepend>
                <q-icon
                  name="access_time"
                  class="cursor-pointer"
                  @click="($refs.timeInput as any).$el.querySelector('input').showPicker()"
                />
              </template>
            </q-input>
          </div>

          <div class="form-field">
            <q-input
              v-model="event.description"
              type="textarea"
              label="Description"
              outlined
              hide-bottom-space
              rows="4"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model.number="event.price"
              type="number"
              label="Price (€)"
              outlined
              hide-bottom-space
              prefix="€"
            />
          </div>

          <div class="form-field">
            <q-select
              v-model="event.tags"
              :options="tagOptions"
              label="Tags"
              outlined
              hide-bottom-space
              multiple
              use-chips
              use-input
              input-debounce="300"
              stack-label
              options-dense
              max-values="3"
              virtual-scroll-slice-size="5"
              popup-content-class="tags-dropdown-popup"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              @filter="filterTags"
            >
              <template #option="scope">
                <q-item
                  v-if="scope.opt.header"
                  class="category-header"
                  :disable="scope.opt.disable"
                >
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
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="form-field">
            <q-select
              v-model="event.collaborators"
              :options="collaboratorOptions"
              label="Collaborators"
              outlined
              hide-bottom-space
              multiple
              use-chips
              use-input
              input-debounce="300"
              options-dense
              :menu-props="{ maxHeight: '200px' }"
              @filter="filterCollaborators"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div class="form-field">
            <q-select
              v-model="event.location"
              :options="locationOptions"
              label="Location *"
              outlined
              hide-bottom-space
              use-input
              fill-input
              hide-selected
              input-debounce="500"
              :error="!!errors.location"
              :error-message="errors.location"
              @filter="filterLocations"
              @update:model-value="handleLocationSelect"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Type at least 3 characters to search
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
            </q-select>
          </div>
          <div class="form-field">
            <ImageCropUpload
              v-model="event.poster"
              label="Event Poster *"
              button-label="Upload Poster"
              :max-size="5000000"
              @error="handleImageError"
            />
            <div v-if="errors.poster" class="error-message">
              {{ errors.poster }}
            </div>
          </div>
          <div class="form-actions">
            <q-btn
              label="Cancel"
              flat
              color="grey-7"
              size="md"
              @click="router.push({ name: 'home' })"
            />
            <div class="action-buttons">
              <q-btn
                label="Save Draft"
                outline
                size="md"
                class="outline-btn-fix"
                @click="saveDraft"
              />
              <q-btn label="Publish Event" unelevated color="primary" size="lg" type="submit" />
            </div>
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-event-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: calc(#{$spacing-4} + 40px + #{$spacing-4});
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
  background: white;
  padding: $spacing-6;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: #1e1e1e;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
}

.form-field {
  margin-bottom: $spacing-4;

  :deep(.q-field) {
    margin-bottom: 0;
  }

  // Hide error area when there's no error
  :deep(.q-field:not(.q-field--error) .q-field__bottom) {
    display: none !important;
    min-height: 0 !important;
    padding: 0 !important;
  }

  // Hide native date/time icons completely
  :deep(input[type='date']::-webkit-calendar-picker-indicator),
  :deep(input[type='time']::-webkit-calendar-picker-indicator) {
    display: none;
  }

  :deep(input[type='date']::-webkit-inner-spin-button),
  :deep(input[type='time']::-webkit-inner-spin-button) {
    display: none;
  }

  // Fix white text in chips
  :deep(.q-chip) {
    .q-chip__content {
      color: white !important;
    }
  }
}

.error-message {
  color: #c10015;
  font-size: 12px;
  padding: 8px 12px 0;
  line-height: 1;

  @include dark-mode {
    color: #f5b0b0;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-8;
  padding-top: $spacing-6;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: $spacing-4;
    align-items: stretch;
  }
}

.action-buttons {
  display: flex;
  gap: $spacing-3;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
}
</style>

<style lang="scss">
.outline-btn-fix.q-btn.q-btn--outline {
  color: #6f00ff !important;
  border-color: #6f00ff !important;
  background: transparent !important;

  &.text-primary {
    color: #6f00ff !important;
  }

  // All text elements
  .q-btn__content,
  .q-btn__content span,
  .q-btn__content .block,
  span,
  span.block,
  .q-icon,
  i,
  i.q-icon,
  i.material-icons {
    color: #6f00ff !important;
  }

  // Deep selectors for scoped components
  :deep(.q-icon),
  :deep(i),
  :deep(i.material-icons) {
    color: #6f00ff !important;
  }

  // Fix all interactive states
  &.q-btn--active,
  &:active,
  &:hover,
  &:focus,
  &.q-hoverable:hover,
  &.q-focusable:focus {
    color: #6f00ff !important;
    background: rgba(111, 0, 255, 0.1) !important;

    .q-btn__content,
    .q-btn__content span,
    .q-btn__content .block,
    span,
    span.block,
    .q-icon,
    i,
    i.q-icon,
    i.material-icons {
      color: #6f00ff !important;
    }

    :deep(.q-icon),
    :deep(i),
    :deep(i.material-icons) {
      color: #6f00ff !important;
    }
  }
}

body.body--dark .outline-btn-fix.q-btn.q-btn--outline {
  color: #bb86fc !important;
  border-color: #bb86fc !important;
  background: transparent !important;

  &.text-primary {
    color: #bb86fc !important;
  }

  // All text elements
  .q-btn__content,
  .q-btn__content span,
  .q-btn__content .block,
  span,
  span.block,
  .q-icon,
  i,
  i.q-icon,
  i.material-icons {
    color: #bb86fc !important;
  }

  :deep(.q-icon),
  :deep(i),
  :deep(i.material-icons) {
    color: #bb86fc !important;
  }

  // Fix all interactive states in dark mode
  &.q-btn--active,
  &:active,
  &:hover,
  &:focus,
  &.q-hoverable:hover,
  &.q-focusable:focus {
    color: #bb86fc !important;
    background: rgba(187, 134, 252, 0.1) !important;

    .q-btn__content,
    .q-btn__content span,
    .q-btn__content .block,
    span,
    span.block,
    .q-icon,
    i,
    i.q-icon,
    i.material-icons {
      color: #bb86fc !important;
    }

    :deep(.q-icon),
    :deep(i),
    :deep(i.material-icons) {
      color: #bb86fc !important;
    }
  }
}

.tags-dropdown-popup {
  max-height: 250px !important;
  overflow-y: auto !important;

  .q-virtual-scroll__content {
    max-height: none !important;
  }

  .q-menu {
    max-height: 250px !important;
    overflow-y: auto !important;
  }

  .category-header {
    background: rgba(0, 0, 0, 0.05);
    cursor: default;
    padding: 8px 16px;

    @include dark-mode {
      background: rgba(255, 255, 255, 0.05);
    }

    .q-item-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }
  }

  .selected-tag {
    @include light-mode {
      background: rgba(25, 118, 210, 0.08);
    }

    @include dark-mode {
      background: rgba(144, 202, 249, 0.08);
    }

    .q-item__label {
      font-weight: 500;
    }
  }
}
</style>
