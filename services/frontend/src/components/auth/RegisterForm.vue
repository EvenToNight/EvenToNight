<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuasar } from 'quasar'
import BaseAuthForm from './BaseAuthForm.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import FormField from '@/components/forms/FormField.vue'
import { goHome, goToLogin } from '@/router/utils'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const authStore = useAuthStore()

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
    nameError.value = 'Name is required'
    isValid = false
  }

  if (!email.value) {
    emailError.value = 'Email is required'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    isValid = false
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm password'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const onSuccessfulRegistration = () => {
  $q.notify({
    type: 'positive',
    message: 'Registration successful!',
  })
  goHome(router, route)
}

const onFailedRegistration = (errorMsg?: string) => {
  $q.notify({
    type: 'negative',
    message: errorMsg || 'Registration failed',
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
    title="Register"
    switch-button-label="Already have an account? Login"
    :is-loading="authStore.isLoading"
    @submit="handleRegister"
    @switch-mode="() => goToLogin(router, route)"
  >
    <template #fields>
      <FormField v-model="name" type="text" label="Name *" icon="person" :error="nameError" />

      <FormField v-model="email" type="email" label="Email *" icon="mail" :error="emailError" />

      <FormField
        v-model="password"
        type="password"
        label="Password *"
        icon="lock"
        :error="passwordError"
      />

      <FormField
        v-model="confirmPassword"
        type="password"
        label="Confirm Password *"
        icon="lock"
        :error="confirmPasswordError"
      />

      <q-checkbox
        v-model="isOrganization"
        label="I'm registering as an organization"
        class="q-mb-md"
      />
    </template>

    <template #submit-button="{ isLoading }">
      <Button
        variant="primary"
        label="Register"
        :loading="isLoading"
        fillContainer
        class="q-mb-md"
        @click="handleRegister"
      />
    </template>
  </BaseAuthForm>
</template>
