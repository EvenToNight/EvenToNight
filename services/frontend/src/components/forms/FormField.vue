<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSlots } from 'vue'

export type FormFieldType = 'text' | 'email' | 'password' | 'date' | 'time' | 'textarea' | 'number'

interface Props {
  modelValue: string
  type?: FormFieldType
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  icon: '',
})

const slots = useSlots()
const hasPrependSlot = computed(() => !!slots.prepend)

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <q-input
    :model-value="modelValue"
    v-bind="$attrs"
    :type="inputType"
    lazy-rules="ondemand"
    hide-bottom-space
    input-debounce="300"
    outlined
    class="form-field q-my-md"
  >
    <template v-if="icon || hasPrependSlot" #prepend>
      <q-icon v-if="icon" :name="icon" />
      <slot v-else name="prepend" />
    </template>
    <template v-if="type === 'password'" #append>
      <q-icon
        :name="showPassword ? 'visibility' : 'visibility_off'"
        class="cursor-pointer"
        @click="togglePasswordVisibility"
      />
    </template>
  </q-input>
</template>
