import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setTokenProvider } from './shared/http'
import { useAuthStore } from './modules/auth/store'

const app = createApp(App)

app.use(createPinia()) // Pinia antes que el router: el guard usa un store
app.use(router)

setTokenProvider(() => useAuthStore().token)

app.mount('#app')
