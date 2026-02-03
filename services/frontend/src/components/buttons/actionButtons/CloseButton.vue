<script setup lang="ts">
import { useTranslation } from '@/composables/useTranslation'
import ActionButton, { type Variant } from './ActionButton.vue'

const { t } = useTranslation('components.buttons.actionButtons.CloseButton')

interface Props {
  variant?: Variant
  onClick: () => void
}

withDefaults(defineProps<Props>(), {
  variant: 'soft',
})
</script>

<template>
  <ActionButton icon="close" :variant="variant" :onClick="onClick" :ariaLabel="t('close')" />
</template>
