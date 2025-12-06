<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <LoginForm />
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary-light 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}
</style>
