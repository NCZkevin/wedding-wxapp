import { createApp } from 'vue'
import App from './App.vue'
import { photoMotion, reveal } from './directives/reveal'
import { router } from './router'
import './styles/main.css'

createApp(App)
  .directive('reveal', reveal)
  .directive('photo-motion', photoMotion)
  .use(router)
  .mount('#app')
