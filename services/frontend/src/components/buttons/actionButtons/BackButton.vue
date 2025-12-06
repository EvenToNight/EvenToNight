<script setup lang="ts">
import { useRouter } from 'vue-router'
import { goBack } from '@/router/utils'
import ActionButton, { type Variant } from './ActionButton.vue'

const router = useRouter()

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton icon="arrow_back" :variant="variant" :onClick="() => goBack(router)" />
</template>
