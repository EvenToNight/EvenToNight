<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import BaseAuthForm from './BaseAuthForm.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'
import { isEmail, matching, notEmpty } from '@/components/forms/validationUtils'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

const $q = useQuasar()
const authStore = useAuthStore()
const { t } = useTranslation('components.auth.RegisterForm')
const logger = createLogger(import.meta.url)
const { goToHome, goToLogin } = useNavigation()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isOrganization = ref(false)

const errorMessage = ref('')

const onSuccessfulRegistration = () => {
  $q.notify({
    type: 'positive',
    message: t('successfulRegistration'),
  })
  goToHome()
}

const onFailedRegistration = (errorMsg?: string) => {
  logger.error('Registration failed:', errorMsg)
  errorMessage.value = t('failedRegistration')
}

const handleRegister = async () => {
  const result = await authStore.register(
    name.value,
    email.value,
    password.value,
    isOrganization.value
  )
  if (result.success) {
    onSuccessfulRegistration()
  } else {
    onFailedRegistration(result.error)
  }
}
</script>

<template>
  <BaseAuthForm
    :title="t('title')"
    :switch-button-label="t('switchToLogin')"
    :is-loading="authStore.isLoading"
    :error-message="errorMessage"
    @submit="handleRegister"
    @switch-mode="goToLogin"
  >
    <template #fields>
      <FormField
        v-model="name"
        type="text"
        :label="t('nameLabel') + ' *'"
        icon="person"
        autocomplete="username"
        :rules="[notEmpty(t('nameError'))]"
      />

      <FormField
        v-model="email"
        type="email"
        :label="t('emailLabel') + ' *'"
        icon="mail"
        autocomplete="email"
        :rules="[notEmpty(t('emailError')), isEmail(t('emailFormatError'))]"
      />

      <!-- TODO: Add password strength validation -->
      <FormField
        v-model="password"
        type="password"
        :label="t('passwordLabel') + ' *'"
        icon="lock"
        autocomplete="new-password"
        :rules="[notEmpty(t('passwordError'))]"
      />

      <FormField
        v-model="confirmPassword"
        type="password"
        :label="t('confirmPasswordLabel') + ' *'"
        icon="lock"
        autocomplete="new-password"
        :rules="[
          notEmpty(t('emptyConfirmPasswordError')),
          matching(password, t('passwordMismatchError')),
        ]"
      />

      <q-checkbox v-model="isOrganization" :label="t('isOrganizationLabel')" class="q-mb-md" />
    </template>

    <template #submit-button="{ isLoading }">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :label="t('register')"
        :loading="isLoading"
        :class="['full-width', 'q-mb-md', 'base-button', 'base-button--primary']"
      />
    </template>
  </BaseAuthForm>
</template>
