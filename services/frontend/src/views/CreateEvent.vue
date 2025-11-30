<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const goBack = () => {
  router.back()
}

const event = ref({
  name: '',
  date: '',
  time: '',
  description: '',
  price: 0,
  tags: [],
  collaborators: [],
  location: null,
  image: null as File | null,
})

const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const onImageSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  event.value.image = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  event.value.image = null
  imagePreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
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

const filterCollaborators = (val: string, update: (callback: () => void) => void) => {
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

const filterLocations = async (val: string, update: (callback: () => void) => void) => {
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
      locationOptions.value = data.map((item: any) => ({
        label: item.display_name,
        value: item,
        description: item.type,
      }))
    })
  } catch (err) {
    console.error('Error fetching locations:', err)
    update(() => {
      locationOptions.value = []
    })
  }
}

const onSubmit = () => {
  if (!event.value.name || !event.value.date || !event.value.time || !event.value.location) {
    $q.notify({
      color: 'negative',
      message: 'Please fill all required fields',
    })
    return
  }

  console.log('Event created:', event.value)
  $q.notify({
    color: 'positive',
    message: 'Event created successfully!',
  })
  // Here you would typically call your API to save the event
}
</script>

<template>
  <div class="create-event-page">
    <q-btn icon="arrow_back" flat round dense color="white" class="back-button" @click="goBack" />

    <div class="page-content">
      <div class="container">
        <h1 class="text-h3 q-mb-lg">Create New Event</h1>

        <q-form class="form-container" @submit="onSubmit">
          <div class="form-field">
            <label class="field-label">Event Image</label>
            <div v-if="imagePreview" class="image-preview-container">
              <img :src="imagePreview" alt="Event preview" class="preview-image" />
              <q-btn
                icon="close"
                round
                dense
                color="negative"
                class="remove-image-btn"
                @click="removeImage"
              />
            </div>
            <div v-else class="image-upload-area" @click="triggerFileInput">
              <q-icon name="add_photo_alternate" size="48px" class="upload-icon" />
              <span class="upload-text">Click to upload event image</span>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="onImageSelect"
              />
            </div>
          </div>

          <div class="form-field">
            <q-input
              v-model="event.name"
              label="Event Name *"
              outlined
              :rules="[(val) => !!val || 'Name is required']"
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

.back-button {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white !important;
  transition: all 0.3s ease;

  :deep(.q-icon) {
    color: white !important;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  @media (max-width: 330px) {
    left: $spacing-2;
  }
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

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: $spacing-2;
  opacity: 0.8;
}

.hidden-file-input {
  display: none;
}

.image-upload-area {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.02);

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.02);
  }

  &:hover {
    border-color: $color-primary;
    background: rgba($color-primary, 0.05);

    .upload-icon {
      color: $color-primary;
      transform: scale(1.1);
    }
  }
}

.upload-icon {
  color: rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;

  @include dark-mode {
    color: rgba(255, 255, 255, 0.4);
  }
}

.upload-text {
  font-size: 0.938rem;
  opacity: 0.7;
  font-weight: 500;
}

.image-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: $spacing-2;
  right: $spacing-2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
