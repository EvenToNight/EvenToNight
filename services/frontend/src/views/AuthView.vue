<script setup lang="ts">
import { computed } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useNavigation } from '@/router/utils'
import { LOGIN_ROUTE_NAME } from '@/router'

const { routeName } = useNavigation()
const isLoginMode = computed(() => routeName === LOGIN_ROUTE_NAME)
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <LoginForm v-if="isLoginMode" />
      <RegisterForm v-else />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-page {
  @include flex-center;
  min-height: 100vh;
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary-light 100%);
  padding: $spacing-5;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}
</style>
