<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const $q = useQuasar()

interface Props {
  previewUrl?: string
  defaultIcon?: string
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  previewUrl: undefined,
  defaultIcon: 'person',
  maxSize: 5000000, // 5MB default
})

const emit = defineEmits<{
  'update:imageFile': [value: File | null]
  error: [message: string]
  remove: []
}>()

const imageFile = ref<File | null>(null)
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
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    // Create preview URL
    croppedImage.value = URL.createObjectURL(blob)

    emit('update:imageFile', file)
    imageFile.value = file
    showCropper.value = false
  } catch (error) {
    console.error('Error cropping image:', error)
    emit('error', 'Failed to crop image')
  }
}

const closeCropper = () => {
  showCropper.value = false
  selectedImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeAvatar = () => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
    croppedImage.value = null
  }
  emit('update:imageFile', null)
}

defineExpose({
  triggerFileInput,
})
</script>

<template>
  <div class="avatar-crop-upload">
    <div class="avatar-preview-container" @click="triggerFileInput">
      <div v-if="croppedImage || previewUrl" class="avatar-preview">
        <img :src="croppedImage || previewUrl" alt="Avatar preview" class="avatar-image" />
        <div class="avatar-overlay">
          <q-icon name="photo_camera" size="32px" color="white" />
        </div>
      </div>
      <div v-else class="avatar-preview">
        <q-icon :name="defaultIcon" size="48px" class="avatar-image" />
        <div class="avatar-overlay">
          <q-icon name="photo_camera" size="32px" color="white" />
        </div>
      </div>
    </div>

    <q-btn
      v-if="croppedImage || previewUrl"
      flat
      dense
      size="sm"
      color="negative"
      icon="delete"
      label="Remove Photo"
      class="remove-button"
      @click.stop="removeAvatar"
    />
    <p v-else class="avatar-hint">Upload your profile photo</p>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelect"
    />

    <q-dialog v-model="showCropper" persistent :maximized="$q.screen.lt.md">
      <q-card class="cropper-dialog">
        <q-card-section class="row items-center q-pb-none dialog-header">
          <div class="text-h6">Crop Photo</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeCropper" />
        </q-card-section>

        <q-card-section class="cropper-container">
          <div class="cropper-wrapper">
            <Cropper
              ref="cropperRef"
              class="cropper"
              :src="selectedImage"
              :stencil-component="CircleStencil"
              :stencil-props="{
                aspectRatio: 1,
                movable: false,
                resizable: false,
              }"
              :stencil-size="{
                width: 280,
                height: 280,
              }"
              image-restriction="stencil"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancel" @click="closeCropper" />
          <q-btn color="primary" label="Save" @click="cropImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.avatar-crop-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
}

.avatar-preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.remove-button {
  margin-top: $spacing-2;
}

.avatar-preview,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: $color-gray-100;

  @include dark-mode {
    background: rgba($color-white, 0.05);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba($color-black, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity $transition-base;

  .avatar-preview:hover & {
    opacity: 1;
  }
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  color: $color-gray-500;
  transition: all $transition-base;

  &:hover {
    background: $color-gray-200;
    color: $color-primary;

    @include dark-mode {
      background: rgba($color-white, 0.1);
    }
  }

  @include dark-mode {
    color: $color-gray-400;
  }
}

.overlay-text {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  text-align: center;
  padding: 0 $spacing-2;
}

.cropper-dialog {
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;

  @media (min-width: $breakpoint-mobile) {
    width: 90vw;
    max-width: 700px;
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

  @media (min-width: $breakpoint-mobile) {
    height: auto;
    min-height: 400px;
    max-height: calc(90vh - 150px);
  }
}

.cropper-wrapper {
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 600px;
  aspect-ratio: 1;

  @media (max-width: $breakpoint-mobile) {
    max-width: 95vw;
    max-height: 70vh;
  }
}

.cropper {
  width: 100%;
  height: 100%;
}

.dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: $spacing-3 $spacing-4;

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}

.avatar-hint {
  font-size: $font-size-sm;
  color: $color-gray-600;
  text-align: center;
  margin: 0;

  @include dark-mode {
    color: $color-gray-400;
  }
}
</style>
