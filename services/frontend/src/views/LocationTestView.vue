<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { CSSProperties } from 'vue'

defineProps<{
  msg: string
}>()

const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const city = ref<string | null>(null)
const country = ref<string | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const boxStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}))

const getCityFromCoords = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
    )
    const data = await response.json()
    city.value =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.municipality ||
      'Unknown'
    country.value = data.address.country || 'Unknown'
  } catch (err) {
    console.error('Error fetching city:', err)
    error.value = 'Failed to get city name'
  }
}

const getLocation = () => {
  loading.value = true
  error.value = null

  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by your browser'
    loading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude
      await getCityFromCoords(latitude.value, longitude.value)
      loading.value = false
    },
    (err) => {
      error.value = `Error: ${err.message}`
      loading.value = false
    }
  )
}

onMounted(() => {
  getLocation()
})
</script>

<template>
  <div class="location-info" :style="boxStyle">
    <h4>Your Location:</h4>
    <div v-if="loading">Loading location...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="latitude && longitude">
      <p><strong>City:</strong> {{ city }}</p>
      <p><strong>Country:</strong> {{ country }}</p>
      <p><strong>Coordinates:</strong> {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}</p>
      <button @click="getLocation">Refresh Location</button>
    </div>
    <div v-else>
      <button @click="getLocation">Get Location</button>
    </div>
  </div>
</template>

<style scoped>
.location-info {
  width: 400px;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.3);
  user-select: none;
}

.location-info h4 {
  margin-top: 0;
  color: #42b883;
  font-size: 1.5em;
  font-weight: bold;
}

.location-info p {
  margin: 0.5rem 0;
  color: #000;
}

.error {
  color: #e74c3c;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
}

button:hover {
  background: #35a372;
}
</style>
