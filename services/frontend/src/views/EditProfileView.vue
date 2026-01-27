<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNavigation } from '@/router/utils'
import { useQuasar } from 'quasar'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'
import AvatarCropUpload from '@/components/imageUpload/AvatarCropUpload.vue'
import FormField from '@/components/forms/FormField.vue'
import { notEmpty } from '@/components/forms/validationUtils'

const authStore = useAuthStore()
const { goToUserProfile } = useNavigation()
const $q = useQuasar()

const name = ref('')
const bio = ref('')
const website = ref('')
const loading = ref(false)
const avatar = ref<File | null>(null)
const currentAvatarUrl = ref<string | undefined>(undefined)
const avatarModified = ref(false)

const isOrganization = computed(() => authStore.user?.role === 'organization')

const defaultIcon = computed(() => {
  return isOrganization.value ? 'business' : 'person'
})

onMounted(() => {
  if (authStore.user) {
    name.value = authStore.user.name || ''
    bio.value = authStore.user.bio || ''
    website.value = authStore.user.website || ''
    currentAvatarUrl.value = authStore.user.avatar || undefined
  }
})

const handleAvatarError = (message: string) => {
  $q.notify({
    color: 'negative',
    message,
  })
}

const handleAvatar = (file: File | null) => {
  avatarModified.value = true
  avatar.value = file
  if (file === null) {
    currentAvatarUrl.value = undefined
  }
}

const handleSave = async () => {
  console.log('Saving profile')
  if (!authStore.user?.id) return

  loading.value = true
  try {
    const updateReq = {
      name: name.value.trim(),
      bio: bio.value.trim() || undefined,
      website: website.value.trim() || undefined,
    }

    const updatedUser = await authStore.updateUser({
      ...updateReq,
      avatarFile: avatarModified.value ? avatar.value : undefined,
    })
    currentAvatarUrl.value = updatedUser.avatar

    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully',
      icon: 'check_circle',
    })
    goToUserProfile(authStore.user.id)
  } catch (error) {
    console.error('Failed to update profile:', error)
    $q.notify({
      color: 'negative',
      message: 'Failed to update profile',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (authStore.user?.id) {
    goToUserProfile(authStore.user.id)
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="edit-profile-view">
    <div class="edit-profile-container">
      <div class="edit-profile-card">
        <div class="card-header">
          <h1 class="page-title">Edit Profile</h1>
        </div>

        <q-form greedy @submit.prevent="handleSave">
          <div class="card-body">
            <div class="avatar-section">
              <AvatarCropUpload
                :preview-url="currentAvatarUrl"
                :default-icon="defaultIcon"
                @error="handleAvatarError"
                @update:imageFile="handleAvatar"
              />
            </div>

            <div class="form-section">
              <FormField
                v-model="name"
                :label="'Name'"
                :placeholder="'Enter your name'"
                :rules="[notEmpty('Name is required')]"
              />

              <FormField
                v-model="bio"
                :label="'Bio'"
                :placeholder="'Enter your bio'"
                type="textarea"
                :rows="4"
                :maxlength="150"
                counter
              />

              <FormField
                v-if="isOrganization"
                v-model="website"
                :label="'Website'"
                :placeholder="'https://example.com'"
              />
            </div>
          </div>

          <div class="card-actions">
            <q-btn
              flat
              :label="'Cancel'"
              class="base-button base-button--secondary"
              type="button"
              @click="handleCancel"
            />
            <q-btn
              unelevated
              color="primary"
              :label="'Save'"
              class="base-button base-button--primary"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.edit-profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  margin-top: calc(-1 * v-bind(NAVBAR_HEIGHT_CSS));
  padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-6});

  @include dark-mode {
    background: #121212;
  }

  @media (max-width: $breakpoint-mobile) {
    padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-4});
  }
}

.edit-profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 $spacing-6 $spacing-8;

  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-4 $spacing-6;
  }
}

.edit-profile-card {
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-base;
  overflow: hidden;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.card-header {
  padding: $spacing-6;
  border-bottom: 1px solid $color-gray-200;

  @include dark-mode {
    border-bottom-color: rgba($color-white, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.page-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  line-height: 1.2;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-2xl;
  }
}

.card-body {
  padding: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
  padding-bottom: $spacing-6;
  border-bottom: 1px solid $color-gray-200;

  @include dark-mode {
    border-bottom-color: rgba($color-white, 0.1);
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-5;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-6;
  border-top: 1px solid $color-gray-200;

  @include dark-mode {
    border-top-color: rgba($color-white, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-3 $spacing-4;
    flex-direction: column-reverse;

    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
