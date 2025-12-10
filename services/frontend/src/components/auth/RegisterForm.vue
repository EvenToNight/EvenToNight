<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import BaseAuthForm from './BaseAuthForm.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'

const $q = useQuasar()
const authStore = useAuthStore()
const { t } = useI18n()
const { goToHome, goToLogin } = useNavigation()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isOrganization = ref(false)

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const validateInput = (): boolean => {
  let isValid = true
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!name.value) {
    nameError.value = t('auth.registerForm.nameError')
    isValid = false
  }

  if (!email.value) {
    emailError.value = t('auth.form.emailError')
    isValid = false
  }

  if (!password.value) {
    passwordError.value = t('auth.form.passwordError')
    isValid = false
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = t('auth.registerForm.emptyConfirmPasswordError')
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = t('auth.registerForm.passwordMismatchError')
    isValid = false
  }

  return isValid
}

const onSuccessfulRegistration = () => {
  $q.notify({
    type: 'positive',
    message: t('auth.registerForm.successfulRegistration'),
  })
  goToHome()
}

const onFailedRegistration = (errorMsg?: string) => {
  $q.notify({
    type: 'negative',
    message: errorMsg || t('auth.registerForm.failedRegistration'),
  })
}

const handleRegister = async () => {
  if (!validateInput()) return
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
    :title="t('auth.register')"
    :switch-button-label="t('auth.registerForm.switchToLogin')"
    :is-loading="authStore.isLoading"
    @submit="handleRegister"
    @switch-mode="goToLogin"
  >
    <template #fields>
      <FormField
        v-model="name"
        type="text"
        :label="t('auth.registerForm.nameLabel') + ' *'"
        icon="person"
        :error="nameError"
      />

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

      <FormField
        v-model="confirmPassword"
        type="password"
        :label="t('auth.registerForm.confirmPasswordLabel') + ' *'"
        icon="lock"
        :error="confirmPasswordError"
      />

      <q-checkbox
        v-model="isOrganization"
        :label="t('auth.registerForm.isOrganizationLabel')"
        class="q-mb-md"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <Button
        type="submit"
        variant="primary"
        :label="t('auth.register')"
        :loading="isLoading"
        fillContainer
        :class="['full-width', 'q-mb-md']"
      />
    </template>
  </BaseAuthForm>
</template>
