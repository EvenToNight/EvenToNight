<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import BaseAuthForm from './BaseAuthForm.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'
import { notEmpty } from '@/components/forms/validationUtils'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

const authStore = useAuthStore()
const $q = useQuasar()
const logger = createLogger(import.meta.url)
const { t } = useTranslation('components.auth.LoginForm')
const { goToHome, goToRegister, goToRedirect } = useNavigation()

const usernameOrEmail = ref('')
const password = ref('')

const errorMessage = ref('')

const onSuccessfulLogin = () => {
  $q.notify({
    type: 'positive',
    message: t('successfulLogin'),
  })
  if (!goToRedirect()) {
    goToHome()
  }
}

const onFailedLogin = (errorMsg?: string) => {
  logger.error('Login failed', { errorMsg })
  errorMessage.value = t('failedLogin')
}

const handleLogin = async () => {
  const result = await authStore.login(usernameOrEmail.value, password.value)
  if (result.success) {
    onSuccessfulLogin()
  } else {
    onFailedLogin(result.error)
  }
}
</script>

<template>
  <BaseAuthForm
    :title="t('title')"
    :switch-button-label="t('switchToRegister')"
    :is-loading="authStore.isLoading"
    :error-message="errorMessage"
    @submit="handleLogin"
    @switch-mode="goToRegister"
  >
    <template #fields>
      <FormField
        v-model="usernameOrEmail"
        type="text"
        :label="t('usernameOrEmailLabel') + ' *'"
        icon="person"
        autocomplete="username"
        :rules="[notEmpty(t('usernameOrEmailError'))]"
      />

      <FormField
        v-model="password"
        type="password"
        :label="t('passwordLabel') + ' *'"
        icon="lock"
        autocomplete="current-password"
        :rules="[notEmpty(t('passwordError'))]"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :label="t('login')"
        :loading="isLoading"
        :class="['full-width', 'q-mb-md', 'base-button', 'base-button--primary']"
      />
    </template>
  </BaseAuthForm>
</template>
