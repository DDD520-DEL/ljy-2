import { createRouter, createWebHashHistory } from 'vue-router'
import Editor from '../views/Editor.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
  { path: '/', component: Editor, meta: { requiresAuth: false } },
  { path: '/share/:shareId', component: Editor, meta: { requiresAuth: false } },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
