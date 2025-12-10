<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import ImageCropUploadTest from '@/components/upload/ImageCropUploadTest.vue'
import { api } from '@/api'
import type { EventData } from '@/api/types/events'
import type { Location } from '@/api/types/common'
import { parseLocation } from '@/api/types/common'
import { useNavigation } from '@/router/utils'
import { useAuthStore } from '@/stores/auth'
import FormField from '@/components/forms/FormField.vue'
import FormSelectorField from '@/components/forms/FormSelectorField.vue'
import type { Tag } from '@/api/types/events'
import Button from '@/components/buttons/basicButtons/Button.vue'
const $q = useQuasar()

const { goToHome, goToEventDetails } = useNavigation()
const authStore = useAuthStore()
const currentUserId = authStore.user?.id

const title = ref('')
const date = ref('')
const time = ref('')
const description = ref('')
const price = ref('0')
const tags = ref<string[]>([])
const collaborators = ref<string[]>([])
const location = ref<Location | null>(null)
const poster = ref<File | null>(null)

const titleError = ref('')
const dateError = ref('')
const timeError = ref('')
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

onMounted(async () => {
  await loadTags()
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

const handleLocationSelect = (selectedLocation: any) => {
  location.value = selectedLocation
  if (location.value) {
    console.log('Location selected:', location.value.link)
  }
}

const validateInput = (): boolean => {
  let isValid = true
  titleError.value = ''
  dateError.value = ''
  timeError.value = ''
  priceError.value = ''
  locationError.value = ''

  if (!title.value) {
    titleError.value = 'Title is required'
    isValid = false
  }

  if (!date.value) {
    dateError.value = 'Date is required'
    isValid = false
  }

  if (!time.value) {
    timeError.value = 'Time is required'
    isValid = false
  }

  if (!price.value) {
    priceError.value = 'Price is required'
    isValid = false
  }

  if (!location.value) {
    locationError.value = 'Location is required'
    isValid = false
  }

  return isValid
}

const saveDraft = async () => {
  titleError.value = ''
  if (!title.value) {
    titleError.value = 'Title is required'
    $q.notify({
      color: 'negative',
      message: 'Please provide at least a title for the draft',
    })
    return
  }
  // TODO implement draft saving
}

const onSubmit = async () => {
  const hasErrors = validateInput()
  if (hasErrors) {
    $q.notify({
      color: 'negative',
      message: 'Please fill all required fields',
    })
    return
  }
  try {
    const dateTime = new Date(`${date.value}T${time.value}`)
    const eventData: EventData = {
      title: title.value,
      description: description.value,
      ...(poster.value ? { poster: poster.value } : {}),
      tags: tags.value,
      location: location.value!,
      date: dateTime,
      price: Number(price.value),
      status: 'published',
      creatorId: currentUserId!,
      collaboratorsId: collaborators.value,
    }
    const response = await api.events.publishEvent(eventData)
    $q.notify({
      color: 'positive',
      message: 'Event published successfully!',
    })
    goToEventDetails(response.eventId)
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
          <FormField v-model="title" type="text" label="Event Title *" :error="titleError" />
          <FormField ref="dateInput" v-model="date" type="date" label="Date *" :error="dateError">
            <template #prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click="($refs.dateInput as any).$el.querySelector('input').showPicker()"
              />
            </template>
          </FormField>

          <FormField ref="timeInput" v-model="time" type="time" label="Time *" :error="timeError">
            <template #prepend>
              <q-icon
                name="access_time"
                class="cursor-pointer"
                @click="($refs.timeInput as any).$el.querySelector('input').showPicker()"
              />
            </template>
          </FormField>

          <FormField v-model="description" type="textarea" label="Description" rows="4" />

          <FormField
            v-model="price"
            type="number"
            label="Price (€)"
            :error="priceError"
            prefix="€"
          />

          <FormSelectorField
            v-model="tags"
            :options="tagOptions"
            label="Tags"
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
            label="Collaborators"
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
                      alt="avatar"
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
            label="Location *"
            use-input
            fill-input
            hide-selected
            input-debounce="500"
            :error="locationError"
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
          </FormSelectorField>

          <div>
            <ImageCropUploadTest
              v-model="poster"
              label="Event Poster *"
              button-label="Upload Poster"
              :max-size="5000000"
              @error="handleImageError"
            />
            <div v-if="posterError" class="error-message">
              {{ posterError }}
            </div>
          </div>
          <div class="form-actions">
            <Button variant="tertiary" :label="'Cancel'" @click="goToHome" />
            <div class="action-buttons">
              <Button
                label="Save Draft"
                outline
                variant="primary"
                size="md"
                class="outline-btn-fix"
                @click="saveDraft"
              />
              <Button label="Publish Event" variant="primary" type="submit" />
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
