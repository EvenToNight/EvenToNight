<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/api'
import type { Tag } from '@/api/types/events'
import type { TagCategory } from '@/api/interfaces/events'

const $q = useQuasar()

// Form fields
const birthDate = ref<string>('')
const gender = ref<'male' | 'female' | 'other' | null>(null)
const notificationsEnabled = ref(true)
const selectedTags = ref<Tag[]>([])
const isDarkMode = ref($q.dark.isActive)

// Available options
const availableTags = ref<TagCategory[]>([])
const loading = ref(true)
const saving = ref(false)

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const maxTags = 5
const canSelectMoreTags = computed(() => selectedTags.value.length < maxTags)

onMounted(async () => {
  try {
    // Load available tags
    availableTags.value = await api.events.getTags()

    // Load user preferences from localStorage or user profile
    isDarkMode.value = $q.dark.isActive
    notificationsEnabled.value = localStorage.getItem('notifications-enabled') !== 'false'

    // TODO: Load from user profile when backend is ready
    // birthDate.value = authStore.user?.birthDate || ''
    // gender.value = authStore.user?.gender || null
    // selectedTags.value = authStore.user?.tags || []
  } catch (error) {
    console.error('Failed to load settings:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load settings',
    })
  } finally {
    loading.value = false
  }
})

const handleThemeToggle = (value: boolean) => {
  $q.dark.set(value)
  isDarkMode.value = value
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

const handleTagToggle = (tag: Tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    // Remove tag
    selectedTags.value.splice(index, 1)
  } else if (canSelectMoreTags.value) {
    // Add tag if we haven't reached the limit
    selectedTags.value.push(tag)
  }
}

const isTagSelected = (tag: Tag) => {
  return selectedTags.value.includes(tag)
}

const handleSave = async () => {
  saving.value = true
  try {
    // Save to localStorage for now
    localStorage.setItem('notifications-enabled', String(notificationsEnabled.value))

    // TODO: Save to backend when API is ready
    // await api.users.updateProfile(authStore.user!.id, {
    //   birthDate: birthDate.value,
    //   gender: gender.value,
    //   tags: selectedTags.value,
    //   notificationsEnabled: notificationsEnabled.value,
    // })

    $q.notify({
      type: 'positive',
      message: 'Settings saved successfully',
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save settings',
    })
  } finally {
    saving.value = false
  }
}

const handleDeleteProfile = () => {
  $q.dialog({
    title: 'Delete Profile',
    message: 'Are you sure you want to delete your profile? This action cannot be undone.',
    cancel: {
      label: 'Cancel',
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: 'Delete',
      color: 'negative',
      flat: true,
    },
    persistent: true,
  }).onOk(async () => {
    try {
      // TODO: Implement API call to delete profile
      // await api.users.deleteProfile(authStore.user!.id)

      $q.notify({
        type: 'positive',
        message: 'Profile deleted successfully',
      })

      // TODO: Logout and redirect to home
      // authStore.logout()
    } catch (error) {
      console.error('Failed to delete profile:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to delete profile',
      })
    }
  })
}
</script>

<template>
  <div class="general-settings-tab">
    <q-inner-loading :showing="loading" />

    <template v-if="!loading">
      <div class="settings-sections">
        <!-- Profile Information Section -->
        <section class="settings-section">
          <h3 class="section-title">Profile Information</h3>

          <div class="form-field">
            <label class="field-label">Birth Date</label>
            <q-input
              v-model="birthDate"
              type="date"
              outlined
              dense
              :max="new Date().toISOString().split('T')[0]"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Gender</label>
            <q-select
              v-model="gender"
              :options="genderOptions"
              outlined
              dense
              emit-value
              map-options
              clearable
            />
          </div>
        </section>

        <!-- Appearance Section -->
        <section class="settings-section">
          <h3 class="section-title">Appearance</h3>

          <div class="form-field">
            <div class="toggle-field">
              <div class="toggle-label">
                <q-icon name="dark_mode" size="24px" class="toggle-icon" />
                <span>Dark Mode</span>
              </div>
              <q-toggle
                :model-value="isDarkMode"
                color="primary"
                @update:model-value="handleThemeToggle"
              />
            </div>
          </div>
        </section>

        <!-- Interests Section -->
        <section class="settings-section">
          <h3 class="section-title">Interests</h3>
          <p class="section-description">
            Select up to {{ maxTags }} tags that match your interests
          </p>

          <div class="tags-container">
            <div v-for="category in availableTags" :key="category.category" class="tag-category">
              <h4 class="category-title">{{ category.category }}</h4>
              <div class="tags-list">
                <q-chip
                  v-for="tag in category.tags"
                  :key="tag"
                  :selected="isTagSelected(tag)"
                  clickable
                  :color="isTagSelected(tag) ? 'primary' : 'grey-4'"
                  :text-color="isTagSelected(tag) ? 'white' : 'dark'"
                  :disable="!isTagSelected(tag) && !canSelectMoreTags"
                  @click="handleTagToggle(tag)"
                >
                  {{ tag }}
                </q-chip>
              </div>
            </div>
          </div>

          <div class="selected-count">{{ selectedTags.length }} / {{ maxTags }} tags selected</div>
        </section>

        <!-- Notifications Section -->
        <section class="settings-section">
          <h3 class="section-title">Notifications</h3>

          <div class="form-field">
            <div class="toggle-field">
              <div class="toggle-label">
                <q-icon name="notifications" size="24px" class="toggle-icon" />
                <span>Enable Notifications</span>
              </div>
              <q-toggle v-model="notificationsEnabled" color="primary" />
            </div>
          </div>
        </section>

        <!-- Save Button -->
        <div class="actions">
          <q-btn label="Save" color="primary" unelevated :loading="saving" @click="handleSave" />
        </div>

        <!-- Danger Zone -->
        <section class="settings-section danger-zone">
          <h3 class="section-title danger-title">Danger Zone</h3>
          <p class="section-description">
            Once you delete your profile, there is no going back. Please be certain.
          </p>

          <q-btn
            label="Delete Profile"
            color="negative"
            outline
            icon="delete_forever"
            @click="handleDeleteProfile"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.general-settings-tab {
  padding: $spacing-6;
  position: relative;
  min-height: 400px;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.settings-sections {
  max-width: 800px;
}

.settings-section {
  margin-bottom: $spacing-8;
  padding-bottom: $spacing-6;
  border-bottom: 1px solid $color-gray-200;

  @include dark-mode {
    border-bottom-color: rgba($color-white, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-2 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.section-description {
  font-size: $font-size-sm;
  color: $color-gray-600;
  margin: 0 0 $spacing-4 0;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.form-field {
  margin-bottom: $spacing-4;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-2;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.toggle-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-3 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.toggle-icon {
  color: $color-gray-600;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.tags-container {
  margin-top: $spacing-4;
}

.tag-category {
  margin-bottom: $spacing-6;

  &:last-child {
    margin-bottom: 0;
  }
}

.category-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-gray-700;
  margin: 0 0 $spacing-3 0;
  text-transform: capitalize;

  @include dark-mode {
    color: $color-gray-300;
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.selected-count {
  margin-top: $spacing-4;
  font-size: $font-size-sm;
  color: $color-gray-600;
  text-align: center;
  font-weight: $font-weight-medium;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.actions {
  margin-top: $spacing-6;
  display: flex;
  justify-content: flex-end;
}

.danger-zone {
  margin-top: $spacing-8;
  padding: $spacing-6;
  border: 2px solid $color-error;
  border-radius: $radius-lg;
  background: rgba($color-error, 0.05);

  @include dark-mode {
    background: rgba($color-error, 0.1);
  }
}

.danger-title {
  color: $color-error;
}
</style>
