<script setup lang="ts">
import Navigation from '@/layouts/Navigation.vue'
</script>

<template>
  <Navigation>
    <div class="contacts">
      <h1>This is a Contacts page</h1>
    </div>
  </Navigation>
</template>

<style lang="scss" scoped>
.contacts {
  @include flex-center;
  min-height: 100vh;
  text-align: center;
}
</style>
