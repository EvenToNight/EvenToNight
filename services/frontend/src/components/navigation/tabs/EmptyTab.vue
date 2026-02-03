<script setup lang="ts">
interface Props {
  emptyText: string
  emptyIconName: string
}

defineProps<Props>()
</script>

<template>
  <div class="empty-state">
    <q-icon :name="emptyIconName" size="64px" color="grey-5" />
    <p class="empty-text">
      {{ emptyText }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  @include flex-column-center;
  padding: $spacing-12 $spacing-6;
  gap: $spacing-4;
}

.empty-text {
  color: $color-gray-500;
  margin: 0;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
  text-align: center;
}
</style>
