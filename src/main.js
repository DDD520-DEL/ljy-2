import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { useTheme } from './stores/theme.js'

const { initTheme } = useTheme()
initTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
