<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import AvatarCropUpload from '@/components/upload/AvatarCropUpload.vue'
import FormField from '@/components/forms/FormField.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import { required } from '@/components/forms/validationUtils'

const authStore = useAuthStore()
const $q = useQuasar()

const name = ref('')
const bio = ref('')
const website = ref('')
const avatar = ref<File | null>(null)
const loading = ref(false)
const currentAvatarUrl = ref<string | undefined>(undefined)

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

const handleSave = async () => {
  if (!authStore.user?.id) return

  loading.value = true
  try {
    // TODO: Implement API call to update user profile
    // await api.users.updateProfile(authStore.user.id, {
    //   name: name.value,
    //   bio: bio.value,
    //   website: website.value,
    //   avatar: avatar.value,
    // })

    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully',
      icon: 'check_circle',
    })

    // Update auth store with new data
    if (authStore.user) {
      authStore.user.name = name.value
      authStore.user.bio = bio.value
      authStore.user.website = website.value
    }
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

const handleReset = () => {
  if (authStore.user) {
    name.value = authStore.user.name || ''
    bio.value = authStore.user.bio || ''
    website.value = authStore.user.website || ''
    currentAvatarUrl.value = authStore.user.avatar || undefined
    avatar.value = null
  }
}
</script>

<template>
  <div class="edit-profile-tab">
    <div class="tab-content">
      <div class="avatar-section">
        <AvatarCropUpload
          v-model="avatar"
          :preview-url="currentAvatarUrl"
          :default-icon="defaultIcon"
          @error="handleAvatarError"
        />
        <p class="avatar-hint">You can upload a profile photo here.</p>
      </div>

      <div class="form-section">
        <FormField
          v-model="name"
          :label="'Name'"
          :placeholder="'Enter your name'"
          :rules="[required]"
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

      <div class="actions">
        <Button :label="'Reset'" variant="secondary" @click="handleReset" />
        <Button :label="'Save Changes'" variant="primary" :loading="loading" @click="handleSave" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.edit-profile-tab {
  height: 100%;
  overflow-y: auto;
  padding: $spacing-6;
  background: var(--q-background);

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-4;
  }
}

.tab-content {
  max-width: 600px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
  padding-bottom: $spacing-6;
  border-bottom: 1px solid var(--q-separator-color);
}

.avatar-hint {
  font-size: $font-size-sm;
  color: var(--q-text-secondary);
  text-align: center;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-5;
  margin-bottom: $spacing-6;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
  padding-top: $spacing-4;
  border-top: 1px solid var(--q-separator-color);

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column-reverse;

    :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
