<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import BaseAuthForm from './BaseAuthForm.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'

const authStore = useAuthStore()
const $q = useQuasar()
const { t } = useI18n()
const { goToHome, goToRegister, goToRedirect } = useNavigation()

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')

const validateInput = (): boolean => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = t('auth.form.emailError')
    isValid = false
  }

  if (!password.value) {
    passwordError.value = t('auth.form.passwordError')
    isValid = false
  }

  return isValid
}

const onSuccessfulLogin = () => {
  $q.notify({
    type: 'positive',
    message: t('auth.loginForm.successfulLogin'),
  })
  if (!goToRedirect()) {
    goToHome()
  }
}

const onFailedLogin = (errorMsg?: string) => {
  $q.notify({
    type: 'negative',
    message: errorMsg || t('auth.loginForm.failedLogin'),
  })
}

const handleLogin = async () => {
  if (!validateInput()) return
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    onSuccessfulLogin()
  } else {
    onFailedLogin(result.error)
  }
}
</script>

<template>
  <BaseAuthForm
    :title="t('auth.login')"
    :switch-button-label="t('auth.loginForm.switchToRegister')"
    :is-loading="authStore.isLoading"
    @submit="handleLogin"
    @switch-mode="goToRegister"
  >
    <template #fields>
      <FormField
        v-model="email"
        type="email"
        :label="t('auth.form.emailLabel') + ' *'"
        icon="mail"
        :error="emailError"
      />

      <FormField
        v-model="password"
        type="password"
        :label="t('auth.form.passwordLabel') + ' *'"
        icon="lock"
        :error="passwordError"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <Button
        type="submit"
        variant="primary"
        :label="t('auth.login')"
        :loading="isLoading"
        :class="['full-width', 'q-mb-md']"
      />
    </template>
  </BaseAuthForm>
</template>
