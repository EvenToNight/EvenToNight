<template>
  <div class="image-crop-upload">
    <label v-if="label" class="field-label">{{ label }}</label>

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
        :label="buttonLabel"
        color="primary"
        outline
        size="lg"
        class="upload-trigger-btn"
        @click="triggerFileInput"
      >
        <q-icon name="add_photo_alternate" left />
      </q-btn>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileSelect"
      />
    </div>

    <q-dialog v-model="showCropper" persistent maximized>
      <q-card class="cropper-dialog">
        <q-card-section class="row items-center q-pb-none dialog-header">
          <div class="text-h6">Crop Image</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeCropper" />
        </q-card-section>

        <q-card-section class="cropper-container">
          <Cropper
            ref="cropperRef"
            class="cropper"
            :src="selectedImage"
            :stencil-component="CircleStencil"
            :stencil-props="{
              aspectRatio: 1,
              movable: false,
              resizable: false,
              handlers: {},
              lines: {},
            }"
            image-restriction="stencil"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeCropper" />
          <q-btn color="primary" label="Crop & Save" @click="cropImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

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
  maxSize: 5000000, // 5MB default
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  error: [message: string]
}>()

const showCropper = ref(false)
const croppedImage = ref<string | null>(null)
const selectedImage = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Check file size
  if (file.size > props.maxSize) {
    emit('error', `Maximum file size is ${props.maxSize / 1000000}MB`)
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    emit('error', 'Only image files are allowed')
    return
  }

  // Read file and show cropper
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

const cropImage = async () => {
  if (!cropperRef.value) return

  const { canvas } = cropperRef.value.getResult()
  if (!canvas) return

  try {
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        },
        'image/jpeg',
        0.9
      )
    })

    // Create File from blob
    const file = new File([blob], 'event-poster.jpg', { type: 'image/jpeg' })

    // Create preview URL
    croppedImage.value = URL.createObjectURL(blob)

    emit('update:modelValue', file)
    showCropper.value = false
  } catch (error) {
    console.error('Error cropping image:', error)
    emit('error', 'Failed to crop image')
  }
}

const removeImage = () => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
  }
  croppedImage.value = null
  selectedImage.value = ''
  emit('update:modelValue', null)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeCropper = () => {
  showCropper.value = false
  selectedImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

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
  padding: $spacing-4 0;
}

.upload-trigger-btn {
  min-width: 200px;
}

.image-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1; // Square ratio matching EventCard
  border-radius: 50%; // Circular preview
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
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

.cropper-dialog {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
}

.dialog-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
}

.cropper-container {
  height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;

  .cropper {
    max-height: 100%;
    width: 100%;
  }

  // Hide stencil handlers (resize corners)
  :deep(.vue-handler),
  :deep(.vue-line-handler),
  :deep(.vue-corner-handler) {
    display: none !important;
  }
}

.dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: $spacing-3 $spacing-4;

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
