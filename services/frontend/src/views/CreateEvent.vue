<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import BackButton from '@/components/navigation/BackButton.vue'
import ImageCropUpload from '@/components/upload/ImageCropUpload.vue'
import { api } from '@/api'
import type { EventData } from '@/api/types/events'
import type { Location } from '@/api/types/common'

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

const handleImageError = (message: string) => {
  $q.notify({
    color: 'negative',
    message,
  })
}

const tagOptions = ['Music', 'Techno', 'House', 'Live', 'Art', 'Food', 'Workshop', 'Nightlife']
const collaboratorOptions = ref<any[]>([])
const locationOptions = ref<any[]>([])

// Mock organizations for search
const allOrganizations = [
  { label: 'Cocoricò', value: 1 },
  { label: 'Baia Imperiale', value: 2 },
  { label: 'Altromondo Studios', value: 3 },
  { label: 'Peter Pan', value: 4 },
  { label: 'Villa delle Rose', value: 5 },
]

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
      locationOptions.value = data.map((item: any) => {
        // Format address properly: combine house number with street
        const addr = item.address || {}
        const street = addr.road || addr.street || ''
        const houseNumber = addr.house_number || ''
        const streetAddress = [street, houseNumber].filter(Boolean).join(' ')

        const fullAddress = [
          streetAddress,
          addr.postcode,
          addr.city || addr.town || addr.village,
          addr.state,
          addr.country,
        ]
          .filter(Boolean)
          .join(', ')

        return {
          label: item.display_name,
          value: {
            address: fullAddress,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
            placeId: item.place_id,
          },
          description: item.type,
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

const onSubmit = async () => {
  if (
    !event.value.title ||
    !event.value.date ||
    !event.value.time ||
    !event.value.location ||
    !event.value.poster
  ) {
    $q.notify({
      color: 'negative',
      message: 'Please fill all required fields',
    })
    return
  }

  try {
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
      status: event.value.status,
      creatorId: currentUserId,
      collaboratorsId: event.value.collaborators,
    }

    // Call API to publish event
    const response = await api.events.publishEvent(eventData)

    $q.notify({
      color: 'positive',
      message: 'Event created successfully!',
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
            <ImageCropUpload
              v-model="event.poster"
              label="Event Poster *"
              button-label="Upload Poster"
              :max-size="5000000"
              @error="handleImageError"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model="event.title"
              label="Event Title *"
              outlined
              :rules="[(val) => !!val || 'Title is required']"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model="event.date"
              type="date"
              label="Date *"
              outlined
              :rules="[(val) => !!val || 'Date is required']"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model="event.time"
              type="time"
              label="Time *"
              outlined
              :rules="[(val) => !!val || 'Time is required']"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model="event.description"
              type="textarea"
              label="Description"
              outlined
              rows="4"
            />
          </div>

          <div class="form-field">
            <q-input
              v-model.number="event.price"
              type="number"
              label="Price (€)"
              outlined
              prefix="€"
            />
          </div>

          <div class="form-field">
            <q-select
              v-model="event.tags"
              :options="tagOptions"
              label="Tags"
              outlined
              multiple
              use-chips
              stack-label
            />
          </div>

          <div class="form-field">
            <q-select
              v-model="event.collaborators"
              :options="collaboratorOptions"
              label="Collaborators"
              outlined
              multiple
              use-chips
              use-input
              input-debounce="0"
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
              use-input
              fill-input
              hide-selected
              input-debounce="500"
              :rules="[(val) => !!val || 'Location is required']"
              @filter="filterLocations"
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

          <div class="row justify-end q-mt-lg">
            <q-btn label="Create Event" type="submit" color="primary" size="lg" />
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
}

.form-field:last-of-type {
  margin-bottom: 0;
}
</style>
