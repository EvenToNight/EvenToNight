<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/api'
import type { Tag } from '@/api/types/events'
import type { TagCategory } from '@/api/interfaces/events'
import FormField from '@/components/forms/FormField.vue'
import FormSelectorField from '@/components/forms/FormSelectorField.vue'
import { useAuthStore } from '@/stores/auth'
import type { Gender } from '@/api/types/users'

const $q = useQuasar()
const authStore = useAuthStore()

// Form fields
const birthDate = ref<string>('')
const gender = ref<Gender | null>(null)
const selectedTags = ref<Tag[]>([])
const isDarkMode = ref($q.dark.isActive)

// Available options
const tagCategories = ref<TagCategory[]>([])
const tagOptions = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)

const dateInput = ref<InstanceType<typeof FormField> | null>(null)

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const maxTags = 5

watch(selectedTags, (newVal, oldVal) => {
  if (oldVal.length === maxTags && newVal.length > maxTags) {
    selectedTags.value = newVal.slice(0, maxTags)
    $q.notify({
      type: 'warning',
      message: `You can only select up to ${maxTags} tags`,
      icon: 'warning',
      position: 'top',
    })
  }
})

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
    tagOptions.value = options
    tagCategories.value = tagResponse
  } catch (error) {
    console.error('Failed to load tags:', error)
  }
}

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

onMounted(async () => {
  try {
    await loadTags()
    isDarkMode.value = authStore.user!.darkMode as boolean
    birthDate.value = authStore.user?.birthDate?.toDateString() || ''
    gender.value = authStore.user?.gender || null
    selectedTags.value = authStore.user?.interests || []
    isDarkMode.value = authStore.user?.darkMode || $q.dark.isActive
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
}

const handleSave = async () => {
  saving.value = true
  try {
    await authStore.updateUser({
      birthDate: new Date(birthDate.value),
      gender: gender.value || undefined,
      interests: selectedTags.value || undefined,
      darkMode: isDarkMode.value,
    })

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
      await api.users.deleteUserById(authStore.user!.id)
      $q.notify({
        type: 'positive',
        message: 'Profile deleted successfully',
      })
      authStore.logout()
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

          <FormField
            ref="dateInput"
            v-model="birthDate"
            type="date"
            label="Birth Date"
            :max="new Date().toISOString().split('T')[0]"
          >
            <template #prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                @click="(dateInput as any)?.$el.querySelector('input').showPicker()"
              />
            </template>
          </FormField>

          <FormSelectorField
            v-model="gender"
            label="Gender"
            :options="genderOptions"
            emit-value
            map-options
            clearable
          />
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

          <FormSelectorField
            v-model="selectedTags"
            :options="tagOptions"
            label="Tags"
            multiple
            use-chips
            use-input
            emit-value
            map-options
            option-value="value"
            option-label="label"
            :hint="`${selectedTags.length} / ${maxTags} tags selected`"
            @filter="filterTags"
          >
            <template #option="scope">
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
            icon="delete_forever"
            outline
            color="negative"
            class="delete-profile-btn"
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
  padding-bottom: $spacing-8;
  position: relative;
  min-height: 400px;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
    padding-bottom: $spacing-6;
  }

  :deep(input[type='date']::-webkit-calendar-picker-indicator) {
    display: none;
  }

  :deep(input[type='date']) {
    color-scheme: light;

    @include dark-mode {
      color-scheme: dark;
    }
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

  &.danger-zone {
    margin-bottom: 0;
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

.actions {
  margin-top: $spacing-6;
  display: flex;
  justify-content: flex-end;
}

.danger-zone {
  margin-top: $spacing-8;
  margin-bottom: $spacing-8;
  padding: $spacing-6;
  border-radius: $radius-lg;
  background: rgba($color-error, 0.05);
  box-shadow: 0 0 0 2px $color-error;

  @include dark-mode {
    background: rgba($color-error, 0.1);
  }
}

.danger-title {
  color: $color-error;
}

:deep(.category-header) {
  background: rgba($color-primary, 0.05);
  font-weight: $font-weight-semibold;
  cursor: default;

  @include dark-mode {
    background: rgba($color-primary, 0.1);
  }
}

:deep(.selected-tag) {
  background: rgba($color-primary, 0.08);

  @include dark-mode {
    background: rgba($color-primary, 0.12);
  }
}
</style>

<style lang="scss">
.delete-profile-btn.q-btn--outline {
  .q-btn__content,
  .q-icon {
    color: black !important;
  }

  body.body--dark & {
    .q-btn__content,
    .q-icon {
      color: white !important;
    }
  }
}
</style>
