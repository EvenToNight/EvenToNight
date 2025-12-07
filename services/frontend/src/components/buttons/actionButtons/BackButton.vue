<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import ActionButton, { type Variant } from './ActionButton.vue'

const { goBack } = useNavigation()

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton icon="arrow_back" class="back-button" :variant="variant" :onClick="goBack" />
</template>

<style lang="scss" scoped>
.back-button {
  position: fixed;
  left: max($spacing-4, calc((100vw - $app-max-width) / 2 + $spacing-4));
}
</style>
