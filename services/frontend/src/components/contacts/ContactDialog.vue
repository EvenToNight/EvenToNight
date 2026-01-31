<script setup lang="ts">
import { ref } from 'vue'
import FormField from '@/components/forms/FormField.vue'
import { isEmail, notEmpty } from '../forms/validationUtils'

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
  console.log('Contact form submitted:', form.value)
  loading.value = false
  show.value = false
  form.value = { ...defaultContactForm }
}

const hideDialog = () => {
  form.value = { ...defaultContactForm }
  console.log('Contact form cancelled')
  show.value = false
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card class="contact-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">Contattaci</div>
        <q-btn flat round dense icon="close" @click="hideDialog" />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form greedy @submit.prevent="handleSubmit">
          <FormField v-model="form.name" type="text" label="Nome" class="input-field" />

          <FormField
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[notEmpty('L\'email è obbligatoria'), isEmail('Inserisci un\'email valida')]"
            class="input-field"
          />

          <FormField
            v-model="form.subject"
            label="Oggetto *"
            :rules="[notEmpty('L\'oggetto è obbligatorio')]"
            class="input-field"
          />

          <FormField
            v-model="form.message"
            label="Messaggio *"
            type="textarea"
            rows="5"
            :rules="[notEmpty('Il messaggio è obbligatorio')]"
            class="input-field"
          />

          <div class="dialog-actions">
            <q-btn flat label="Annulla" @click="hideDialog" />
            <q-btn type="submit" color="primary" label="Invia" :loading="loading" />
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
