<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useQuasar, QForm } from 'quasar'
import BackButton from '@/components/navigation/BackButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const formRef = ref<QForm | null>(null)
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const isOrganization = ref(false)
const isPwd = ref(true)
const isConfirmPwd = ref(true)

// Error messages
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const nameError = ref('')

onMounted(() => {
  // Check if we're on the register route
  if (route.name === 'register') {
    isLoginMode.value = false
  }
})

// Watch for route changes
watch(
  () => route.name,
  (newRouteName) => {
    isLoginMode.value = newRouteName === 'login'
    // Reset form when switching
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    name.value = ''
    isOrganization.value = false
    // Reset errors
    emailError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
    nameError.value = ''
    // Reset validation
    formRef.value?.resetValidation()
  }
)

const handleLogin = async () => {
  // Reset errors
  emailError.value = ''
  passwordError.value = ''

  // Validate
  let hasError = false
  if (!email.value) {
    emailError.value = 'Email is required'
    hasError = true
  }
  if (!password.value) {
    passwordError.value = 'Password is required'
    hasError = true
  }

  if (hasError) return

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Login successful!',
    })
    const redirectPath = route.query.redirect as string
    const locale = route.params.locale || 'en'
    const targetPath = redirectPath || { name: 'home', params: { locale } }
    router.push(targetPath)
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || 'Login failed',
    })
  }
}

const handleRegister = async () => {
  // Reset errors
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  nameError.value = ''

  // Validate
  let hasError = false
  if (!name.value) {
    nameError.value = 'Name is required'
    hasError = true
  }
  if (!email.value) {
    emailError.value = 'Email is required'
    hasError = true
  }
  if (!password.value) {
    passwordError.value = 'Password is required'
    hasError = true
  }
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm password'
    hasError = true
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    hasError = true
  }

  if (hasError) return

  // TODO: Implement registration API call
  $q.notify({
    type: 'info',
    message: `Registration for ${isOrganization.value ? 'organization' : 'user'} not yet implemented`,
  })
}

const switchMode = () => {
  // Navigate to the appropriate route instead of just toggling state
  if (isLoginMode.value) {
    router.push({ name: 'register' })
  } else {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <q-card class="login-card">
    <BackButton variant="minimal" action="home" class="back-button-login" />
    <q-card-section class="card-header">
      <div class="text-h5">{{ isLoginMode ? 'Login' : 'Register' }}</div>
    </q-card-section>

    <q-card-section>
      <q-form ref="formRef" @submit.prevent="isLoginMode ? handleLogin() : handleRegister()">
        <!-- Name field (only for registration) -->
        <q-input
          v-if="!isLoginMode"
          v-model="name"
          filled
          label="Name *"
          :error="!!nameError"
          :error-message="nameError"
          hide-bottom-space
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- Email field -->
        <q-input
          v-model="email"
          filled
          type="email"
          label="Email *"
          :error="!!emailError"
          :error-message="emailError"
          hide-bottom-space
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="mail" />
          </template>
        </q-input>

        <!-- Password field -->
        <q-input
          v-model="password"
          filled
          :type="isPwd ? 'password' : 'text'"
          label="Password *"
          :error="!!passwordError"
          :error-message="passwordError"
          hide-bottom-space
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <!-- Confirm Password field (only for registration) -->
        <q-input
          v-if="!isLoginMode"
          v-model="confirmPassword"
          filled
          :type="isConfirmPwd ? 'password' : 'text'"
          label="Confirm Password *"
          :error="!!confirmPasswordError"
          :error-message="confirmPasswordError"
          hide-bottom-space
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isConfirmPwd = !isConfirmPwd"
            />
          </template>
        </q-input>

        <!-- Organization checkbox (only for registration) -->
        <q-checkbox
          v-if="!isLoginMode"
          v-model="isOrganization"
          label="I'm registering as an organization"
          class="q-mb-md"
        />

        <!-- Submit button -->
        <q-btn
          type="submit"
          color="primary"
          :label="isLoginMode ? 'Login' : 'Register'"
          :loading="authStore.isLoading"
          class="full-width q-mb-md"
        />

        <!-- Switch mode button -->
        <div class="text-center">
          <q-btn
            flat
            :label="isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'"
            color="primary"
            @click="switchMode"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="scss">
.login-card {
  max-width: 450px;
  margin: 0 auto;
  position: relative;
}

.back-button-login {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1;
}

.card-header {
  padding-bottom: 0;

  .text-h5 {
    text-align: center;
  }
}
</style>
