<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  variant?: 'default' | 'minimal'
  action?: 'back' | 'home'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  action: 'back',
})

const goBack = () => {
  if (props.action === 'home') {
    router.push({ name: 'home' })
  } else {
    router.back()
  }
}
</script>

<template>
  <q-btn
    icon="arrow_back"
    flat
    :round="props.variant === 'default'"
    dense
    :color="props.variant === 'default' ? 'white' : undefined"
    :class="props.variant === 'default' ? 'back-button' : 'back-button-minimal'"
    @click="goBack"
  />
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

.back-button-minimal {
  position: fixed;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  transition: all 0.3s ease;

  :deep(.q-icon) {
    @include light-mode {
      color: black !important;
    }
    @include dark-mode {
      color: white !important;
    }
  }

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 330px) {
    left: $spacing-2;
  }
}
</style>
