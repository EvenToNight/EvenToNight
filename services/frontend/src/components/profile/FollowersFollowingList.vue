<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type { UserID, UserInfo } from '@/api/types/users'
import type { PaginatedRequest } from '@/api/interfaces/commons'
import { api } from '@/api'
import UserInfoCard from '@/components/cards/UserInfoCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'

type ListType = 'followers' | 'following'

interface Props {
  userId: UserID
  type: ListType
}

const props = defineProps<Props>()
const show = defineModel<boolean>({ required: true })
const { t } = useI18n()
const $q = useQuasar()

const users = ref<UserInfo[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const totalItems = ref(0)

const ITEMS_PER_PAGE = 20

const title = computed(() => {
  if (props.type === 'followers') {
    return t('userProfile.followers')
  }
  return t('userProfile.following')
})

const emptyText = computed(() => {
  if (props.type === 'followers') {
    return t('userProfile.noFollowers', 'Nessun follower')
  }
  return t('userProfile.noFollowing', 'Non segui nessuno')
})

const loadUsers = async (isLoadingMore = false) => {
  if (isLoadingMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const pagination: PaginatedRequest = {
      offset: isLoadingMore ? users.value.length : 0,
      limit: ITEMS_PER_PAGE,
    }

    const response =
      props.type === 'followers'
        ? await api.interactions.followers(props.userId, pagination)
        : await api.interactions.following(props.userId, pagination)

    if (isLoadingMore) {
      users.value = [...users.value, ...response.items]
    } else {
      users.value = response.items
    }

    hasMore.value = response.hasMore
    totalItems.value = response.totalItems
  } catch (error) {
    console.error(`Failed to load ${props.type}:`, error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    await loadUsers(true)
  } finally {
    done(!hasMore.value)
  }
}

const onShow = () => {
  users.value = []
  hasMore.value = true
  loadUsers()
}

const handleUserClick = () => {
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show" :maximized="$q.screen.lt.md" @show="onShow">
    <q-card class="followers-following-dialog" :class="{ 'mobile-dialog': $q.screen.lt.md }">
      <q-card-section class="dialog-header">
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          round
          dense
          icon="arrow_back"
          class="back-button"
          @click="show = false"
        />
        <div class="dialog-title">
          <span class="title-text">{{ title }}</span>
          <span v-if="totalItems > 0" class="title-count">({{ totalItems }})</span>
        </div>
        <q-btn v-if="!$q.screen.lt.md" flat round dense icon="close" @click="show = false" />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-inner-loading :showing="loading && users.length === 0">
          <q-spinner-dots color="primary" size="50px" />
        </q-inner-loading>

        <q-infinite-scroll
          v-if="!loading && users.length > 0"
          :offset="250"
          :disable="loadingMore || !hasMore"
          class="users-scroll"
          @load="onLoad"
        >
          <div class="users-list">
            <UserInfoCard
              v-for="user in users"
              :key="user.userId"
              :user="user"
              @click="handleUserClick"
            />
          </div>

          <template #loading>
            <div class="loading-state">
              <q-spinner-dots color="primary" size="50px" />
            </div>
          </template>
        </q-infinite-scroll>

        <EmptyTab
          v-else-if="!loading && users.length === 0"
          :empty-text="emptyText"
          :empty-icon-name="type === 'followers' ? 'people_outline' : 'person_add_alt'"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.followers-following-dialog {
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  &.mobile-dialog {
    width: 100vw;
    max-width: 100vw;
    max-height: 100vh;
    height: 100vh;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-4 $spacing-6;
  flex-shrink: 0;

  @include light-mode {
    background-color: $color-background;
    border-bottom: 1px solid $color-border;
  }

  @include dark-mode {
    background-color: $color-background-dark;
    border-bottom: 1px solid $color-border-dark;
  }

  .back-button {
    margin-right: $spacing-2;
  }

  .dialog-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .title-text {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: $color-text-primary;

      @include dark-mode {
        color: $color-text-white;
      }
    }

    .title-count {
      font-size: $font-size-base;
      color: $color-text-secondary;

      @include dark-mode {
        color: $color-text-dark;
      }
    }
  }
}

.dialog-content {
  padding: 0;
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 400px;

  .mobile-dialog & {
    min-height: auto;
  }
}

.users-scroll {
  height: 100%;
  overflow-y: auto;
}

.users-list {
  @include flex-column;
  padding: $spacing-2;
}

.loading-state {
  @include flex-center;
  padding: $spacing-8;
}
</style>
