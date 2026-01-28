<script setup lang="ts">
import { ref } from 'vue'

const show = defineModel<boolean>({ required: true })

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  // TODO: Implement contact form submission
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Contact form submitted:', form.value)
  loading.value = false
  show.value = false
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
}
</script>

<template>
  <q-dialog v-model="show">
    <q-card class="contact-dialog">
      <q-card-section class="dialog-header">
        <div class="text-h6">Contattaci</div>
        <q-btn flat round dense icon="close" @click="show = false" />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-form @submit.prevent="handleSubmit">
          <q-input
            v-model="form.name"
            label="Nome"
            outlined
            :rules="[(val) => !!val || 'Il nome è obbligatorio']"
            class="input-field"
          />

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined
            :rules="[
              (val) => !!val || 'L\'email è obbligatoria',
              (val) => /.+@.+\..+/.test(val) || 'Inserisci un\'email valida',
            ]"
            class="input-field"
          />

          <q-input
            v-model="form.subject"
            label="Oggetto"
            outlined
            :rules="[(val) => !!val || 'L\'oggetto è obbligatorio']"
            class="input-field"
          />

          <q-input
            v-model="form.message"
            label="Messaggio"
            type="textarea"
            outlined
            rows="5"
            :rules="[(val) => !!val || 'Il messaggio è obbligatorio']"
            class="input-field"
          />

          <div class="dialog-actions">
            <q-btn flat label="Annulla" @click="show = false" />
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
