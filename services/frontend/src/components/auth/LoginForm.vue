<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import BaseAuthForm from './BaseAuthForm.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import FormField from '@/components/forms/FormField.vue'
import { goHome, goToRegister } from '@/router/utils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')

const validateInput = (): boolean => {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  }

  return isValid
}

const onSuccessfulLogin = () => {
  $q.notify({
    type: 'positive',
    message: 'Login successful!',
  })
  const redirectPath = route.query.redirect as string
  if (redirectPath) {
    router.push(redirectPath)
  } else {
    goHome(router, route)
  }
}

const onFailedLogin = (errorMsg?: string) => {
  $q.notify({
    type: 'negative',
    message: errorMsg || 'Login failed',
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
    title="Login"
    switch-button-label="Need an account? Register"
    :is-loading="authStore.isLoading"
    @submit="handleLogin"
    @switch-mode="() => goToRegister(router, route)"
  >
    <template #fields>
      <FormField v-model="email" type="email" label="Email *" icon="mail" :error="emailError" />

      <FormField
        v-model="password"
        type="password"
        label="Password *"
        icon="lock"
        :error="passwordError"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <Button
        type="submit"
        variant="primary"
        label="Login"
        :loading="isLoading"
        fillContainer
        class="q-mb-md"
      />
    </template>
  </BaseAuthForm>
</template>
