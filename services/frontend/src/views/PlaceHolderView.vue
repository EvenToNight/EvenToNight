<script setup lang="ts">
import { onMounted, onUnmounted, reactive, computed } from 'vue'
import { FORBIDDEN_ROUTE_NAME, NOT_FOUND_ROUTE_NAME, SERVER_ERROR_ROUTE_NAME } from '@/router'
import { useNavigation } from '@/router/utils'
import { useTranslation } from '@/composables/useTranslation'

const { t } = useTranslation('views.PlaceHolderView')
const { routeName, goToHome } = useNavigation()

const message = computed(() => {
  if (routeName.value === FORBIDDEN_ROUTE_NAME) {
    return 'FORBIDDEN 🚫'
  }
  if (routeName.value === NOT_FOUND_ROUTE_NAME) {
    return 'NOT FOUND 🥸'
  }
  if (routeName.value === SERVER_ERROR_ROUTE_NAME) {
    return 'SERVER ERROR 💥'
  }
  return 'EvenToNight🌚'
})

const state = reactive({
  x: 100,
  y: 100,
  dx: 2,
  dy: 2,
  color: '#00ffe1',
})

const colors = ['#00ffe1', '#ff00c8', '#ffcc00', '#00ff6a', '#ff6a00', '#cc00ff']
const dvdStyle = reactive({
  left: state.x + 'px',
  top: state.y + 'px',
  backgroundColor: state.color,
  boxShadow: `0 0 20px ${state.color}`,
})

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)]
}

function move() {
  const dvd = document.getElementById('dvd')!
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const dvdWidth = dvd.offsetWidth
  const dvdHeight = dvd.offsetHeight

  state.x += state.dx
  state.y += state.dy

  if (state.x + dvdWidth >= screenWidth || state.x <= 0) {
    state.dx *= -1
    state.color = randomColor()!
  }
  if (state.y + dvdHeight >= screenHeight || state.y <= 0) {
    state.dy *= -1
    state.color = randomColor()!
  }

  dvdStyle.left = state.x + 'px'
  dvdStyle.top = state.y + 'px'
  dvdStyle.backgroundColor = state.color
  dvdStyle.boxShadow = `0 0 20px ${state.color}`

  requestAnimationFrame(move)
}

onMounted(() => {
  document.body.style.backgroundColor = 'black'
  move()
})

onUnmounted(() => {
  document.body.style.backgroundColor = ''
})
</script>

<template>
  <div
    id="dvd"
    :style="dvdStyle"
    role="button"
    tabindex="0"
    @click="() => goToHome()"
    @keydown.enter="() => goToHome()"
  >
    <div class="dvd-content">
      <div class="main-message">{{ message }}</div>
      <div class="sub-message">{{ t('navigationMessageHint') }}</div>
    </div>
  </div>
  <div
    class="home-link"
    role="button"
    tabindex="0"
    @click="() => goToHome()"
    @keydown.enter="() => goToHome()"
  >
    {{ t('navigationMessage') }}
  </div>
</template>

<style scoped>
#dvd {
  position: absolute;
  width: 250px;
  height: 120px;
  color: #000;
  font-weight: bold;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  user-select: none;
  cursor: pointer;
  transition: transform 0.1s ease;
}

#dvd:hover {
  transform: scale(1.05);
}

#dvd:active {
  transform: scale(0.95);
}

.dvd-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.main-message {
  font-size: 1.5em;
}

.sub-message {
  font-size: 0.7em;
  opacity: 0.8;
}

.home-link {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-family: sans-serif;
  font-size: 1em;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.home-link:hover {
  text-decoration: underline;
}
</style>
