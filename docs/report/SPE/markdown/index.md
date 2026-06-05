<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.href = withBase('/introduction')
})
</script>
<template>
<div/>
</template>
