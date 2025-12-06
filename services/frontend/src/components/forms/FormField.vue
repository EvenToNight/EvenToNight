<script setup lang="ts">
import { ref, computed } from 'vue'

export type FormFieldType = 'text' | 'email' | 'password'

interface Props {
  modelValue: string
  label: string
  type?: FormFieldType
  error?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  error: '',
  icon: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const rules = computed(() => {
  if (props.type === 'email') {
    return [
      (val: string) => {
        if (!val) return true // Empty validation is handled by required check
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(val) || 'Please enter a valid email address'
      },
    ]
  }
  return undefined
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleInput = (value: string | number | null) => {
  emit('update:modelValue', String(value || ''))
}
</script>

<template>
  <q-input
    :model-value="modelValue"
    filled
    :type="inputType"
    :label="label"
    :error="!!error"
    :error-message="error"
    :rules="rules"
    lazy-rules
    hide-bottom-space
    class="form-field q-mb-md"
    @update:model-value="handleInput"
  >
    <template v-if="icon" #prepend>
      <q-icon :name="icon" />
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

<style scoped lang="scss">
//.form-field {}
</style>
