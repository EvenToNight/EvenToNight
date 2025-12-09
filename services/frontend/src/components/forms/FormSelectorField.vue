<script setup lang="ts">
import { defineProps } from 'vue'

interface Props {
  modelValue: any
}

defineProps<Props>()
</script>

<template>
  <q-select
    :model-value="modelValue"
    v-bind="$attrs"
    outlined
    hide-bottom-space
    popup-content-class="tags-dropdown-popup"
    virtual-scroll-slice-size="5"
    class="q-mb-md"
  >
    <template #option="scope">
      <slot name="option" v-bind="scope" />
    </template>
    <template #no-option>
      <slot name="no-option">
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </slot>
    </template>
  </q-select>
</template>
