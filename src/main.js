import { createRouter, createWebHistory } from 'vue-router'
import { createApp } from 'vue'
import store from './store'
import App from './App.vue'
import Ao from './components/Ao.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Ao },
    { path: '/:move1?/:move2?/:move3?/:move4?/:move5?/:move6?/:move7?', component: Ao },
    // { path: '*', component: Ao },
  ],
})

createApp(App).use(store).use(router).mount('#ao')
