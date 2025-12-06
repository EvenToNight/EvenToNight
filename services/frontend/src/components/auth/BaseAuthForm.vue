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
    <BackHomeButton variant="soft" class="back-button" />
    <q-card-section class="card-header">
      <div class="text-h5">{{ title }}</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="handleSubmit">
        <!-- Form fields slot -->
        <slot name="fields" />

        <!-- Submit button slot -->
        <slot name="submit-button" :is-loading="isLoading" />

        <!-- Switch mode button -->
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

.back-button {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1;
}

.card-header {
  .text-h5 {
    text-align: center;
  }
}
</style>
