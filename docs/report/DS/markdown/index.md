<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.href = withBase('/goals')
})
</script>
<template>
<div/>
</template>