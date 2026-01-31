<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import type { UserInfo } from '@/api/types/users'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import UserInfoCard from '@/components/cards/UserInfoCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'
import type { PaginatedRequest, PaginatedResponse } from '@/api/interfaces/commons'

const ITEMS_PER_PAGE = 20

interface Props {
  loadFn: (pagination?: PaginatedRequest) => Promise<PaginatedResponse<UserInfo>>
  title: string
  emptyText: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyIcon: 'people_outline',
})

const show = defineModel<boolean>({ required: true })
const $q = useQuasar()

const {
  items: users,
  loading,
  loadingMore,
  hasMore,
  onLoad,
  reload,
} = useInfiniteScroll<UserInfo>({
  itemsPerPage: ITEMS_PER_PAGE,
  loadFn: async (limit, offset) => {
    return props.loadFn({ limit, offset })
  },
})

const totalItems = computed(() => users.value.length)

const onShow = () => {
  reload()
}
</script>

<template>
  <q-dialog v-model="show" :maximized="$q.screen.lt.md" @show="onShow">
    <q-card
      class="followers-following-dialog"
      :class="{ 'mobile-dialog': $q.screen.lt.md }"
      :style="$q.screen.lt.md ? '' : 'width: 600px; max-width: 90vw; max-height: 80vh'"
    >
      <q-card-section class="row items-center justify-between no-wrap q-px-lg q-py-md">
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="arrow_back"
          class="q-mr-sm"
          @click="show = false"
        />
        <div class="col row items-center q-gutter-sm">
          <span class="text-h6 text-weight-bold">{{ props.title }}</span>
          <span v-if="totalItems > 0" class="text-body2 text-grey-6">({{ totalItems }})</span>
        </div>
        <q-btn v-if="!$q.screen.lt.md" flat round dense icon="close" @click="show = false" />
      </q-card-section>

      <q-separator />

      <q-card-section
        class="col overflow-hidden relative-position q-pa-none"
        :style="$q.screen.lt.md ? '' : 'min-height: 400px'"
      >
        <q-inner-loading :showing="loading && users.length === 0">
          <q-spinner-dots color="primary" size="50px" />
        </q-inner-loading>

        <q-infinite-scroll
          v-if="!loading && users.length > 0"
          :offset="250"
          :disable="loadingMore || !hasMore"
          class="full-height overflow-auto"
          @load="onLoad"
        >
          <div class="column q-pa-sm q-gutter-sm">
            <UserInfoCard
              v-for="user in users"
              :key="user.userId"
              :user="user"
              @click="show = false"
            />
          </div>

          <template #loading>
            <div class="flex flex-center q-pa-xl">
              <q-spinner-dots color="primary" size="50px" />
            </div>
          </template>
        </q-infinite-scroll>

        <EmptyTab
          v-else-if="!loading && users.length === 0"
          :empty-text="props.emptyText"
          :empty-icon-name="props.emptyIcon"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
