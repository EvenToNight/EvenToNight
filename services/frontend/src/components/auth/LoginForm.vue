<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import BaseAuthForm from './BaseAuthForm.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'
import { notEmpty } from '@/components/forms/validationUtils'

const authStore = useAuthStore()
const $q = useQuasar()
const { t } = useI18n()
const { goToHome, goToRegister, goToRedirect } = useNavigation()

const usernameOrEmail = ref('')
const password = ref('')

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
    :title="t('auth.login')"
    :switch-button-label="t('auth.loginForm.switchToRegister')"
    :is-loading="authStore.isLoading"
    @submit="handleLogin"
    @switch-mode="goToRegister"
  >
    <template #fields>
      <FormField
        v-model="usernameOrEmail"
        type="text"
        label="Username or Email*"
        icon="person"
        :rules="[notEmpty('Username or Email is required')]"
      />

      <FormField
        v-model="password"
        type="password"
        :label="t('auth.form.passwordLabel') + ' *'"
        icon="lock"
        :rules="[notEmpty(t('auth.form.passwordError'))]"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <q-btn
        unelevated
        color="primary"
        type="submit"
        :label="t('auth.login')"
        :loading="isLoading"
        :class="['full-width', 'q-mb-md', 'base-button', 'base-button--primary']"
      />
    </template>
  </BaseAuthForm>
</template>
