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
  <ActionButton icon="arrow_back" :variant="variant" :onClick="goToHome" />
</template>
