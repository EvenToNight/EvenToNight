<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'
import ActionButton, { type Variant } from './ActionButton.vue'

const { goBack } = useNavigation()
const { t } = useTranslation('components.buttons.actionButtons.BackButton')

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
    class="back-button"
    :variant="variant"
    :onClick="goBack"
    :ariaLabel="t('goBack')"
  />
</template>

<style lang="scss" scoped>
.back-button {
  position: fixed;
  left: max($spacing-4, calc((100vw - $app-max-width) / 2 + $spacing-4));
}
</style>
