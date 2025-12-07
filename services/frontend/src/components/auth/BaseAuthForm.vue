<script setup lang="ts">
import BackHomeButton from '@/components/buttons/actionButtons/BackHomeButton.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'

interface Props {
  title: string
  switchButtonLabel: string
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
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
      <q-form @submit.prevent="handleSubmit">
        <slot name="fields" />
        <slot name="submit-button" :is-loading="isLoading" />
        <div class="text-center">
          <Button variant="secondary" :label="switchButtonLabel" @click="handleSwitch" />
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
</style>
