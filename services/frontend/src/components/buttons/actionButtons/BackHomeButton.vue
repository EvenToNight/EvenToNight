<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { goHome } from '@/router/utils'
import ActionButton, { type Variant } from './ActionButton.vue'

const router = useRouter()
const route = useRoute()

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton icon="arrow_back" :variant="variant" :onClick="() => goHome(router, route)" />
</template>
