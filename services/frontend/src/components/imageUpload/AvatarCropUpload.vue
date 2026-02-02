<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleStencil } from 'vue-advanced-cropper'
import BaseCropUpload from './BaseCropUpload.vue'
import { DEFAULT_AVATAR_URL } from '@/stores/auth'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  previewUrl: string
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 5000000,
})

const emit = defineEmits<{
  imageFile: [value: File | null]
  error: [message: string]
  remove: []
}>()

const { t } = useTranslation('components.imageUpload.AvatarCropUpload')
const isDefault = computed(() => {
  return props.previewUrl === DEFAULT_AVATAR_URL
})

const baseCropUploadRef = ref<InstanceType<typeof BaseCropUpload> | null>(null)
const croppedImage = ref<string | null>(null)

const stencilProps = {
  aspectRatio: 1,
  movable: false,
  resizable: false,
}

const stencilSize = {
  width: 280,
  height: 280,
}

const handleImageUpdate = (file: File) => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
  }

  croppedImage.value = URL.createObjectURL(file)
  emit('imageFile', file)
}

const removeAvatar = () => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
    croppedImage.value = null
  }
  emit('imageFile', null)
  emit('remove')
}

const triggerFileInput = () => {
  baseCropUploadRef.value?.triggerFileInput()
}

defineExpose({
  triggerFileInput,
})
</script>

<template>
  <div class="avatar-crop-upload">
    <BaseCropUpload
      ref="baseCropUploadRef"
      :max-size="maxSize"
      :stencil-component="CircleStencil"
      :stencil-props="stencilProps"
      :stencil-size="stencilSize"
      :dialog-title="t('title')"
      @imageFile="handleImageUpdate"
      @error="emit('error', $event)"
    >
      <template #empty-state="{ triggerFileInput: trigger }">
        <div class="avatar-preview-container" @click="trigger">
          <div class="avatar-preview">
            <img :src="croppedImage || previewUrl" alt="Avatar preview" class="avatar-image" />
            <div class="avatar-overlay">
              <q-icon name="photo_camera" size="32px" color="white" />
            </div>
          </div>
        </div>
      </template>
    </BaseCropUpload>

    <q-btn
      v-if="!isDefault"
      flat
      dense
      size="sm"
      color="negative"
      icon="delete"
      :label="t('removeAvatar')"
      class="remove-button"
      @click.stop="removeAvatar"
    />
    <p v-else class="avatar-hint">{{ t('hint') }}</p>
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

.avatar-preview {
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
