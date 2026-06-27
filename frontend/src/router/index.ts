import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/Layout.vue'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home,
        },
        {
          path: '/rurun',
          name: 'rurun',
          component: () => import('@/views/Rurun.vue'),
        },
        {
          path: '/chat',
          name: 'chat',
          component: () => import('@/views/Chat.vue'),
        }
      ],
    },
  ],
})

export default router
