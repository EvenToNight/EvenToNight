<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import ActionButton, { type Variant } from './ActionButton.vue'

const { goToHome } = useNavigation()

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton icon="home" class="home-button" :variant="variant" :onClick="goToHome" />
</template>

<style lang="scss" scoped>
.home-button {
  position: fixed;
  right: max($spacing-4, calc((100vw - $app-max-width) / 2 + $spacing-4));
  left: auto;
}
</style>
