<script setup lang="ts">
import BackHomeButton from '@/components/buttons/actionButtons/BackHomeButton.vue'

interface Props {
  title: string
  switchButtonLabel: string
  isLoading?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  errorMessage: '',
})

const emit = defineEmits<{
  submit: []
  switchMode: []
}>()

const handleSubmit = () => {
  emit('submit')
}

const handleSwitch = () => {
  emit('switchMode')
}
</script>

<template>
  <q-card class="auth-card">
    <BackHomeButton variant="soft" />
    <q-card-section class="card-header">
      <div class="text-h5">{{ title }}</div>
    </q-card-section>

    <q-card-section>
      <q-form greedy @submit.prevent="handleSubmit">
        <q-banner v-if="errorMessage" class="error-banner bg-negative q-mb-md" rounded dense>
          <template #avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <slot name="fields" />
        <slot name="submit-button" :is-loading="isLoading" />
        <div class="text-center">
          <q-btn
            flat
            :label="switchButtonLabel"
            :class="['full-width', 'base-button', 'base-button--secondary']"
            @click="handleSwitch"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="scss">
.auth-card {
  max-width: 450px;
}

.card-header {
  .text-h5 {
    text-align: center;
  }
}

.error-banner {
  :deep(.q-banner__content) {
    color: $color-white !important;
  }
}
</style>
