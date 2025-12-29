<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSlots, computed } from 'vue'

interface Props {
  modelValue: any
  error?: string
}

defineProps<Props>()
const { t } = useI18n()
const slots = useSlots()

const hasOptionSlot = computed(() => !!slots.option)
</script>

<template>
  <q-select
    :model-value="modelValue"
    v-bind="$attrs"
    lazy-rules="ondemand"
    outlined
    hide-bottom-space
    popup-content-class="tags-dropdown-popup"
    virtual-scroll-slice-size="5"
    input-debounce="300"
    class="q-my-md"
  >
    <template v-if="hasOptionSlot" #option="scope">
      <slot name="option" v-bind="scope" />
    </template>
    <template #no-option>
      <slot name="no-option">
        <q-item>
          <q-item-section class="text-grey"> {{ t('search.noResultsText') }} </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>
