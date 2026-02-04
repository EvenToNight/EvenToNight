<script setup lang="ts">
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'
import ActionButton, { type Variant } from './ActionButton.vue'

const { goToHome } = useNavigation()
const { t } = useTranslation('components.buttons.actionButtons.HomeButton')

interface Props {
  variant?: Variant
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <ActionButton
    icon="home"
    class="home-button"
    :variant="variant"
    :onClick="goToHome"
    :ariaLabel="t('goToHome')"
  />
</template>

<style lang="scss" scoped>
.home-button {
  position: fixed;
  right: max($spacing-4, calc((100vw - $app-max-width) / 2 + $spacing-4));
  left: auto;
}
</style>
