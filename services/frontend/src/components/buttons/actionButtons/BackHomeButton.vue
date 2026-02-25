<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'
import ActionButton, { type Variant } from './ActionButton.vue'

const { goToHome } = useNavigation()
const { t } = useTranslation('components.buttons.actionButtons.BackHomeButton')

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton
    icon="arrow_back"
    :variant="variant"
    :onClick="goToHome"
    :ariaLabel="t('goToHome')"
  />
</template>
