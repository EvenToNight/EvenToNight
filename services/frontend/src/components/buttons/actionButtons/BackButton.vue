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
  <ActionButton icon="arrow_back" :variant="variant" :onClick="goBack" />
</template>
