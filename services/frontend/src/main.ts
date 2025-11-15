import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dark } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dark,
  },
})

// Imposta il tema light mode (false = light, true = dark)
Dark.set(false)
//Dark.set(true)
app.use(createPinia())
app.use(router)
app.mount('#app')
