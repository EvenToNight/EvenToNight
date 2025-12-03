import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dark, Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)

app.use(Quasar, {
  plugins: {
    Dark,
    Notify,
  },
})

// Imposta il tema light mode (false = light, true = dark)
Dark.set(false)
//Dark.set(true)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
