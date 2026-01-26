<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { Cropper, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const $q = useQuasar()

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

// Watch for external changes to modelValue (e.g., when loading an existing event)
watch(
  () => props.modelValue,
  (newFile) => {
    if (newFile && !croppedImage.value) {
      // Create preview URL for the file
      croppedImage.value = URL.createObjectURL(newFile)
    } else if (!newFile && croppedImage.value) {
      // Clean up when file is removed
      URL.revokeObjectURL(croppedImage.value)
      croppedImage.value = null
    }
  },
  { immediate: true }
)

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
        unelevated
        color="primary"
        :label="buttonLabel"
        :icon="'add_photo_alternate'"
        outline
        size="sm"
        class="base-button base-button--primary outline-btn-fix upload-trigger-btn"
        @click="triggerFileInput"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="onFileSelect"
      />
    </div>

    <q-dialog v-model="showCropper" persistent :maximized="$q.screen.lt.md">
      <q-card class="cropper-dialog">
        <q-card-section class="row items-center q-pb-none dialog-header">
          <div class="text-h6">Crop Image</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeCropper" />
        </q-card-section>

        <q-card-section class="cropper-container">
          <div class="cropper-wrapper">
            <Cropper
              ref="cropperRef"
              class="cropper"
              :src="selectedImage"
              :stencil-component="RectangleStencil"
              :stencil-props="{
                aspectRatio: 1,
                movable: false,
                resizable: false,
                handlers: {},
                lines: {},
              }"
              :stencil-size="{
                width: 320,
                height: 320,
              }"
              image-restriction="stencil"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeCropper" />
          <q-btn color="primary" label="Crop & Save" @click="cropImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  aspect-ratio: 1; // Square ratio matching EventCard
  border-radius: 24px; // Rounded corners matching EventCard
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

.cropper-dialog {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;

  // Modal style for desktop
  @media (min-width: $breakpoint-mobile) {
    width: 90vw;
    max-width: 900px;
    height: auto;
    max-height: 90vh;
    border-radius: 16px;
  }
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

  // Better height for desktop modal
  @media (min-width: $breakpoint-mobile) {
    height: auto;
    min-height: 400px;
    max-height: calc(90vh - 150px);
  }
}

.cropper-wrapper {
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  aspect-ratio: 4 / 3;

  @media (max-width: $breakpoint-mobile) {
    max-width: 95vw;
    max-height: 70vh;
  }
}

.cropper {
  width: 100%;
  height: 100%;

  // Hide stencil handlers (resize corners)
  :deep(.vue-handler),
  :deep(.vue-line-handler),
  :deep(.vue-corner-handler) {
    display: none !important;
  }

  // Round the stencil corners to match EventCard
  :deep(.vue-rectangle-stencil__preview) {
    border-radius: 24px;
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
