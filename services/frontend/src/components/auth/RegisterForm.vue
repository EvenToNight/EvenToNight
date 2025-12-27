<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import BaseAuthForm from './BaseAuthForm.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import FormField from '@/components/forms/FormField.vue'
import { useNavigation } from '@/router/utils'
import { isEmail, matching, notEmpty } from '@/components/forms/validationUtils'

const $q = useQuasar()
const authStore = useAuthStore()
const { t } = useI18n()
const { goToHome, goToLogin } = useNavigation()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isOrganization = ref(false)

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
        :rules="[notEmpty(t('auth.registerForm.nameError'))]"
      />

      <FormField
        v-model="email"
        type="email"
        :label="t('auth.form.emailLabel') + ' *'"
        icon="mail"
        :rules="[isEmail(t('auth.form.emailError'))]"
      />

      <FormField
        v-model="password"
        type="password"
        :label="t('auth.form.passwordLabel') + ' *'"
        icon="lock"
        :rules="[notEmpty(t('auth.form.passwordError'))]"
      />

      <FormField
        v-model="confirmPassword"
        type="password"
        :label="t('auth.registerForm.confirmPasswordLabel') + ' *'"
        icon="lock"
        :rules="[
          notEmpty(t('auth.registerForm.emptyConfirmPasswordError')),
          matching(password, t('auth.registerForm.passwordMismatchError')),
        ]"
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
