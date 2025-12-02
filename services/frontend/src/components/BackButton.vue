<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <q-btn icon="arrow_back" flat round dense color="white" class="back-button" @click="goBack" />
</template>

<style lang="scss" scoped>
.back-button {
  position: fixed;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white !important;
  transition: all 0.3s ease;

  :deep(.q-icon) {
    color: white !important;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }

  @media (max-width: 330px) {
    left: $spacing-2;
  }
}
</style>
