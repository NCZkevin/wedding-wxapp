import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'invite', component: () => import('./views/InviteView.vue') },
    { path: '/schedule', name: 'schedule', component: () => import('./views/ScheduleView.vue') },
    { path: '/travel', name: 'travel', component: () => import('./views/TravelView.vue') },
    { path: '/interact', name: 'interact', component: () => import('./views/InteractView.vue') },
    { path: '/rsvp', name: 'rsvp', component: () => import('./views/RsvpView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
