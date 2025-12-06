<script setup lang="ts">
import ActionButton, { type Variant } from './ActionButton.vue'

interface Props {
  variant?: Variant
  onClick: () => void
}

withDefaults(defineProps<Props>(), {
  variant: 'soft',
})
</script>

<template>
  <ActionButton icon="close" :variant="variant" :onClick="onClick" />
</template>
