<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.href = withBase('/introduzione')
})
</script>
<template>
<div/>
</template>