<script setup lang="ts">
interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const close = () => {
  emit('update:isOpen', false)
}
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="isOpen"
      class="drawer-body-overlay"
      role="button"
      tabindex="0"
      @click="close"
      @keydown.enter="close"
    ></div>
  </Transition>
  <Transition name="drawer">
    <div
      v-if="isOpen"
      class="drawer-overlay"
      role="button"
      tabindex="0"
      @click="close"
      @keydown.enter="close"
    >
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <q-btn flat dense icon="close" @click="close" />
        </div>
        <div class="drawer-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.drawer-overlay {
  @include flex-end;
  @include absolute-fill;
  z-index: $z-index-modal;
}

.drawer {
  @include flex-column;
  width: 300px;
  max-width: 80vw;
  min-width: 240px;
  height: 100vh;
  background: $color-white;
  box-shadow: $shadow-lg;
  @include dark-mode {
    background: $color-background-dark;
  }
}

.drawer-header {
  @include flex-end;
  padding: $spacing-4;
  border-bottom: 1px solid color-alpha($color-black, 0.1);

  @include dark-mode {
    border-bottom-color: color-alpha($color-white, 0.1);
  }
}

.drawer-content {
  @include flex-column;
  flex: 1;
  padding: $spacing-10;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity $transition-base;

  .mobile-drawer {
    transition: transform $transition-base;
  }
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;

  .mobile-drawer {
    transform: translateX(100%);
  }
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;

  .mobile-drawer {
    transform: translateX(0);
  }
}

.drawer-body-overlay {
  @include fixed-fill;
  background: color-alpha($color-black, 0.6);
  z-index: $z-index-modal-backdrop;
  cursor: pointer;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity $transition-base;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-to,
.overlay-fade-leave-from {
  opacity: 1;
}
</style>
