<script setup lang="ts">
import type { SearchResult } from '@/api/utils'
import SearchResultCard from '@/components/cards/SearchResultCard.vue'

interface Props {
  organizations: SearchResult[]
  loading: boolean
  searchQuery: string
}

defineProps<Props>()
</script>

<template>
  <div class="tab-content">
    <div v-if="loading" class="loading-state">
      <q-spinner-dots color="primary" size="50px" />
    </div>
    <div v-else-if="organizations.length > 0" class="users-list">
      <SearchResultCard v-for="result in organizations" :key="result.id" :result="result" />
    </div>
    <div v-else-if="searchQuery" class="empty-state">
      <q-icon name="business" size="64px" color="grey-5" />
      <p class="empty-text">Nessuna organizzazione trovata</p>
    </div>
    <div v-else class="empty-state">
      <q-icon name="search" size="64px" color="grey-5" />
      <p class="empty-text">Cerca organizzazioni per nome</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  @include flex-column;
  gap: $spacing-4;
}

.users-list {
  @include flex-column;
  gap: $spacing-3;
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}

.empty-state {
  @include flex-column;
  @include flex-center;
  gap: $spacing-4;
  padding: $spacing-8;
  text-align: center;
}

.empty-text {
  color: $color-gray-500;
  margin: 0;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
}
</style>
