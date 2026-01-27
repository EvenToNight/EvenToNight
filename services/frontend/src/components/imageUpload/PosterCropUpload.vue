<script setup lang="ts">
import { ref, watch } from 'vue'
import { RectangleStencil } from 'vue-advanced-cropper'
import BaseCropUpload from './BaseCropUpload.vue'

interface Props {
  modelValue?: File | null
  label?: string
  buttonLabel?: string
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Event Image',
  buttonLabel: 'Upload Image',
  maxSize: 5000000,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  error: [message: string]
}>()

const baseCropUploadRef = ref<InstanceType<typeof BaseCropUpload> | null>(null)
const croppedImage = ref<string | null>(null)

const stencilProps = {
  aspectRatio: 1,
  movable: false,
  resizable: false,
  handlers: {},
  lines: {},
}

const stencilSize = {
  width: 320,
  height: 320,
}

watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile && !croppedImage.value) {
      croppedImage.value = URL.createObjectURL(newFile)
    } else if (!newFile && croppedImage.value) {
      URL.revokeObjectURL(croppedImage.value)
      croppedImage.value = null
    }
  },
  { immediate: true }
)

const handleImageUpdate = (file: File) => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
  }
  croppedImage.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

const removeImage = () => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
  }
  croppedImage.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="image-crop-upload">
    <label v-if="label" class="field-label">{{ label }}</label>

    <BaseCropUpload
      ref="baseCropUploadRef"
      :max-size="maxSize"
      :stencil-component="RectangleStencil"
      :stencil-props="stencilProps"
      :stencil-size="stencilSize"
      dialog-title="Crop Image"
      @update:image-file="handleImageUpdate"
      @error="emit('error', $event)"
    >
      <template #empty-state="{ triggerFileInput: trigger }">
        <div v-if="croppedImage" class="image-preview-container">
          <img :src="croppedImage" alt="Cropped preview" class="preview-image" />
          <q-btn
            icon="close"
            round
            dense
            color="negative"
            class="remove-image-btn"
            @click="removeImage"
          />
        </div>

        <div v-else class="upload-button-container">
          <q-btn
            unelevated
            color="primary"
            :label="buttonLabel"
            icon="add_photo_alternate"
            outline
            size="sm"
            class="base-button base-button--primary outline-btn-fix upload-trigger-btn"
            @click="trigger"
          />
        </div>
      </template>

      <template #actions="{ cropImage, closeCropper }">
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeCropper" />
          <q-btn color="primary" label="Crop & Save" @click="cropImage" />
        </q-card-actions>
      </template>
    </BaseCropUpload>
  </div>
</template>

<style lang="scss" scoped>
.image-crop-upload {
  width: 100%;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: $spacing-2;
  opacity: 0.8;
}

.upload-button-container {
  display: flex;
  justify-content: center;
}

.upload-trigger-btn {
  min-width: 160px;
}

.image-preview-container {
  position: relative;
  width: 200px;
  height: 200px;
  aspect-ratio: 1;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  margin: 0 auto;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: $breakpoint-mobile) {
    width: 150px;
    height: 150px;
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: $spacing-2;
  right: $spacing-2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
