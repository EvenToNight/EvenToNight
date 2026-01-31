<script setup lang="ts">
interface Props {
  loading: boolean
  label?: string
}
defineProps<Props>()
</script>

<template>
  <q-inner-loading :showing="loading" :label="label" />
  <template v-if="!loading">
    <slot />
  </template>
</template>
