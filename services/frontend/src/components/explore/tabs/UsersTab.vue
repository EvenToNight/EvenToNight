<script setup lang="ts">
import { ref } from 'vue'
import UserCard from '@/components/cards/UserCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import type { User } from '@/api/types/users'

interface Props {
  users: User[]
  emptyText: string
  emptyIconName: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
}

const props = defineProps<Props>()

const loading = ref(false)

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!props.hasMore || !props.onLoadMore) {
    done(true)
    return
  }

  loading.value = true

  try {
    await props.onLoadMore()
  } finally {
    loading.value = false
    done(!props.hasMore)
  }
}
</script>

<template>
  <div class="users-tab">
    <q-infinite-scroll
      v-if="users.length > 0"
      :offset="250"
      class="users-scroll"
      :disable="loading"
      @load="onLoad"
    >
      <div class="users-list">
        <UserCard v-for="user in users" :key="user.id" :user="user" />
      </div>
    </q-infinite-scroll>
    <template v-else>
      <EmptyTab :emptyText="emptyText" :emptyIconName="emptyIconName" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.users-tab {
  @include flex-column;
}

.users-scroll {
  height: 100%;
}

.users-list {
  @include flex-column;
  gap: $spacing-4;
}
</style>
