<script setup lang="ts">
import { ref } from 'vue'
import FormField from '@/components/forms/FormField.vue'
import { isEmail, notEmpty } from '../forms/validationUtils'
import { createLogger } from '@/utils/logger'
import { useTranslation } from '@/composables/useTranslation'

const logger = createLogger(import.meta.url)
const { t } = useTranslation('components.contacts.ContactDialog')
const show = defineModel<boolean>({ required: true })
const loading = ref(false)

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const defaultContactForm: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const form = ref<ContactForm>({ ...defaultContactForm })

const handleSubmit = async () => {
  loading.value = true
  // TODO: Implement contact form submission
  await new Promise((resolve) => setTimeout(resolve, 1000))
  logger.info('Contact form submitted:', form.value)
  loading.value = false
  show.value = false
  form.value = { ...defaultContactForm }
}

const hideDialog = () => {
  form.value = { ...defaultContactForm }
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card class="contact-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">{{ t('title') }}</div>
        <q-btn flat round dense icon="close" @click="hideDialog" />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form greedy @submit.prevent="handleSubmit">
          <FormField v-model="form.name" type="text" :label="t('nameLabel')" class="input-field" />

          <FormField
            v-model="form.email"
            :label="t('emailLabel') + ' *'"
            type="email"
            :rules="[notEmpty(t('emailError')), isEmail(t('emailFormatError'))]"
            class="input-field"
          />

          <FormField
            v-model="form.subject"
            :label="t('subjectLabel') + ' *'"
            :rules="[notEmpty(t('subjectError'))]"
            class="input-field"
          />

          <FormField
            v-model="form.message"
            :label="t('messageLabel') + ' *'"
            type="textarea"
            rows="5"
            :rules="[notEmpty(t('messageError'))]"
            class="input-field"
          />

          <div class="dialog-actions">
            <q-btn flat :label="t('cancelLabel')" @click="hideDialog" />
            <q-btn type="submit" color="primary" :label="t('submitLabel')" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.contact-dialog {
  min-width: 500px;

  @media (max-width: $breakpoint-mobile) {
    min-width: 90vw;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-4 $spacing-6;

  @include light-mode {
    background-color: $color-background;
    border-bottom: 1px solid $color-border;
  }

  @include dark-mode {
    background-color: $color-background-dark;
    border-bottom: 1px solid $color-border-dark;
  }
}

.dialog-content {
  padding: $spacing-6;
}

.input-field {
  margin-bottom: $spacing-4;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-2;
  margin-top: $spacing-4;
}
</style>
