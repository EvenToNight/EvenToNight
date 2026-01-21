<script setup lang="ts">
interface Props {
  loading: boolean
}
defineProps<Props>()
</script>

<template>
  <q-inner-loading :showing="loading" />
  <template v-if="!loading">
    <slot />
  </template>
</template>
