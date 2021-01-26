import { createRouter, createWebHistory } from 'vue-router'
import { createApp } from 'vue'
import App from './App.vue'
import Ao from './Ao.vue'
import Bull from './components/Lightning.vue'
import store from './store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Ao },
    { path: '/about', component: Bull },
  ],
})

createApp(App).use(store).use(router).mount('#ao')
