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
import { createLogger } from '@/utils/logger'
import { useTranslation } from '@/composables/useTranslation'

const logger = createLogger(import.meta.url)
const authStore = useAuthStore()
const { goToUserProfile } = useNavigation()
const { t } = useTranslation('views.EditProfileView')
const $q = useQuasar()

const name = ref('')
const bio = ref('')
const website = ref('')
const loading = ref(false)
const avatar = ref<File | null>(null)
const currentAvatarUrl = ref<string | undefined>(undefined)
const avatarModified = ref(false)

const defaultIcon = computed(() => {
  return authStore.isOrganization ? 'business' : 'person'
})

onMounted(() => {
  //TODO: check redirection to login if not authenticated
  if (authStore.user) {
    name.value = authStore.user.name || ''
    bio.value = authStore.user.bio || ''
    website.value = authStore.user.website || ''
    currentAvatarUrl.value = authStore.user.avatar
  }
})

const handleAvatarError = (message: string) => {
  logger.error('Avatar upload error:', message)
  $q.notify({
    color: 'negative',
    message: t('form.messages.errors.imageUpload'),
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
  logger.log('Saving profile')
  if (!authStore.isAuthenticated) return

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
      message: t('form.messages.success.profileUpdate'),
      icon: 'check_circle',
    })
    goToUserProfile(authStore.user!.id)
  } catch (error) {
    logger.error('Failed to update profile:', error)
    $q.notify({
      color: 'negative',
      message: t('form.messages.errors.profileUpdate'),
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  if (authStore.isAuthenticated) {
    goToUserProfile(authStore.user!.id)
  }
}
</script>

<template>
  <NavigationButtons />

  <div class="edit-profile-view">
    <div class="edit-profile-container">
      <div class="edit-profile-card">
        <div class="card-header">
          <h1 class="page-title">{{ t('title') }}</h1>
        </div>

        <q-form greedy @submit.prevent="handleSave">
          <div class="card-body">
            <div class="avatar-section">
              <AvatarCropUpload
                :preview-url="currentAvatarUrl"
                :default-icon="defaultIcon"
                @error="handleAvatarError"
                @imageFile="handleAvatar"
              />
            </div>

            <div class="form-section">
              <FormField
                v-model="name"
                :label="t('form.name.label')"
                :placeholder="t('form.name.placeholder')"
                :rules="[notEmpty(t('form.name.error'))]"
              />

              <FormField
                v-model="bio"
                :label="t('form.bio.label')"
                :placeholder="t('form.bio.placeholder')"
                type="textarea"
                :rows="4"
                :maxlength="150"
                counter
              />

              <FormField
                v-if="authStore.isOrganization"
                v-model="website"
                :label="t('form.website.label')"
                :placeholder="t('form.website.placeholder')"
              />
            </div>
          </div>

          <div class="card-actions">
            <q-btn
              flat
              :label="t('form.actions.cancel')"
              class="base-button base-button--secondary"
              type="button"
              @click="handleCancel"
            />
            <q-btn
              unelevated
              color="primary"
              :label="t('form.actions.save')"
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
