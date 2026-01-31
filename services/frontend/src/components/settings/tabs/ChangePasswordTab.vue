<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import FormField from '@/components/forms/FormField.vue'
import { notEmpty, matching } from '@/components/forms/validationUtils'

const authStore = useAuthStore()
const $q = useQuasar()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleChangePassword = async () => {
  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully',
    })

    errorMessage.value = ''
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    errorMessage.value = error.message || 'La password attuale non è corretta.'
  }
}
</script>

<template>
  <div class="change-password-tab">
    <div class="password-header">
      <h2 class="password-title">Change Password</h2>
      <p class="password-subtitle">Update your password to keep your account secure</p>
    </div>

    <q-form greedy class="password-form" @submit.prevent="handleChangePassword">
      <FormField
        v-model="currentPassword"
        type="password"
        label="Current Password *"
        icon="lock"
        :rules="[notEmpty('Current password is required')]"
      />

      <FormField
        v-model="newPassword"
        type="password"
        label="New Password *"
        icon="lock"
        :rules="[notEmpty('New password is required')]"
      />

      <FormField
        v-model="confirmPassword"
        type="password"
        label="Confirm New Password *"
        icon="lock"
        :rules="[
          notEmpty('Please confirm your new password'),
          matching(newPassword, 'Passwords do not match'),
        ]"
      />
      <div v-if="errorMessage" class="text-negative text-center q-my-md">
        {{ errorMessage }}
      </div>

      <div class="form-actions">
        <q-btn
          unelevated
          color="primary"
          type="submit"
          label="Change Password"
          :loading="authStore.isLoading"
          class="submit-button base-button base-button--primary"
        />
      </div>
    </q-form>
  </div>
</template>

<style lang="scss" scoped>
.change-password-tab {
  padding: $spacing-6;
  max-width: 600px;
}

.password-header {
  margin-bottom: $spacing-6;
}

.password-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin: 0 0 $spacing-2 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.password-subtitle {
  font-size: $font-size-sm;
  color: $color-gray-600;
  margin: 0;

  @include dark-mode {
    color: $color-gray-400;
  }
}

.password-form {
  display: flex;
  flex-direction: column;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-4;
}

.submit-button {
  min-width: 180px;
}
</style>
