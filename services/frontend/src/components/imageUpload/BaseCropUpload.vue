<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

interface Props {
  maxSize?: number
  stencilComponent: any
  stencilProps: Record<string, any>
  stencilSize: { width: number; height: number }
  dialogTitle?: string
}

const { t } = useTranslation('components.imageUpload.BaseCropUpload')
const logger = createLogger(import.meta.url)
const props = withDefaults(defineProps<Props>(), {
  maxSize: 5000000,
  dialogTitle: t('title'),
})

const emit = defineEmits<{
  imageFile: [value: File]
  error: [message: string]
}>()

const $q = useQuasar()

const showCropper = ref(false)
const selectedImage = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (file.size > props.maxSize) {
    emit('error', `${t('fileTooBigError')} ${props.maxSize / 1000000}MB`)
    return
  }

  if (!file.type.startsWith('image/')) {
    emit('error', t('fileTypeError'))
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const cropImage = async () => {
  if (!cropperRef.value) return

  const { canvas } = cropperRef.value.getResult()
  if (!canvas) return

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error(t('blobCreationError')))
        },
        'image/jpeg',
        0.9
      )
    })

    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
    emit('imageFile', file)
    showCropper.value = false
  } catch (error) {
    logger.error('Error cropping image:', error)
    emit('error', t('cropError'))
  }
}

const closeCropper = () => {
  showCropper.value = false
  selectedImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({
  triggerFileInput,
})
</script>

<template>
  <div class="base-crop-upload">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="onFileSelect"
    />

    <slot name="empty-state" :trigger-file-input="triggerFileInput" />

    <q-dialog v-model="showCropper" persistent :maximized="$q.screen.lt.md">
      <q-card class="cropper-dialog">
        <q-card-section class="row items-center q-pb-none dialog-header">
          <div class="text-h6">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeCropper" />
        </q-card-section>

        <q-card-section class="cropper-container">
          <div class="cropper-wrapper">
            <Cropper
              ref="cropperRef"
              class="cropper"
              :src="selectedImage"
              :stencil-component="stencilComponent"
              :stencil-props="stencilProps"
              :stencil-size="stencilSize"
              image-restriction="stencil"
            />
          </div>
        </q-card-section>
        <slot name="actions" :crop-image="cropImage" :close-cropper="closeCropper">
          <q-card-actions align="right" class="dialog-actions">
            <q-btn flat :label="t('dialogCancelButton')" @click="closeCropper" />
            <q-btn color="primary" :label="t('dialogConfirmButton')" @click="cropImage" />
          </q-card-actions>
        </slot>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.base-crop-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
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
  padding: $spacing-2 $spacing-3;

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
}

.cropper-container {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: $breakpoint-mobile) {
    height: calc(100vh - 120px);
  }

  @media (min-width: $breakpoint-mobile) {
    min-height: 300px;
    max-height: 500px;
  }
}

.cropper-wrapper {
  width: 100%;
  max-width: min(500px, 80vw);
  aspect-ratio: 1;
  position: relative;

  @media (max-width: $breakpoint-mobile) {
    max-width: 90vw;
    max-height: calc(100vh - 160px);
  }
}

.cropper {
  width: 100%;
  height: 100%;
}

.dialog-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: $spacing-2 !important;
  gap: $spacing-2;
  min-height: unset !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  :deep(.q-btn) {
    margin: 0 !important;
  }

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
