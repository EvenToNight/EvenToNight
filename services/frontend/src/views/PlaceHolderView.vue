<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive } from 'vue'

export default defineComponent({
  name: 'PlaceHolderView',
  setup() {
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

    return { dvdStyle }
  },
})
</script>

<template>
  <div id="dvd" :style="dvdStyle">EvenToNight🌚</div>
</template>

<style scoped>
#dvd {
  position: absolute;
  width: 200px;
  height: 100px;
  color: #000;
  font-size: 1.5em;
  font-weight: bold;
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  user-select: none;
}
</style>
