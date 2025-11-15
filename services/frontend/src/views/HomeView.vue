<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <div class="home-fullscreen">
    <div class="content-left">
      <div class="content-wrapper">
        <TheWelcome />
      </div>
    </div>
    <div class="content-right">
      <!-- Spazio vuoto a destra -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-fullscreen {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;

  @include respond-to('lg') {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
}

.content-left {
  padding: 2rem;

  @include respond-to('lg') {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }
}

.content-wrapper {
  width: 100%;

  @include respond-to('lg') {
    max-width: 580px;
  }
}

.content-right {
  display: none;

  @include respond-to('lg') {
    display: block;
  }
}

:deep(a) {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
  padding: 3px;

  @media (hover: hover) {
    &:hover {
      background-color: hsla(160, 100%, 37%, 0.2);
    }
  }
}
</style>
