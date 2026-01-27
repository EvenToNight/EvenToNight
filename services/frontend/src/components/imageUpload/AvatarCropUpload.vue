<script setup lang="ts">
import { ref } from 'vue'
import { CircleStencil } from 'vue-advanced-cropper'
import BaseCropUpload from './BaseCropUpload.vue'

interface Props {
  previewUrl?: string
  defaultIcon?: string
  maxSize?: number
}

withDefaults(defineProps<Props>(), {
  previewUrl: undefined,
  defaultIcon: 'person',
  maxSize: 5000000,
})

const emit = defineEmits<{
  'update:imageFile': [value: File | null]
  error: [message: string]
  remove: []
}>()

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
  emit('update:imageFile', file)
}

const removeAvatar = () => {
  if (croppedImage.value) {
    URL.revokeObjectURL(croppedImage.value)
    croppedImage.value = null
  }
  emit('update:imageFile', null)
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
      dialog-title="Crop Photo"
      @update:image-file="handleImageUpdate"
      @error="emit('error', $event)"
    >
      <template #empty-state="{ triggerFileInput: trigger }">
        <div class="avatar-preview-container" @click="trigger">
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
      </template>
    </BaseCropUpload>

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
