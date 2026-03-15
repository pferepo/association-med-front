import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Invite Pages
import InviteDashboard from '@/pages/invite/InviteDashboard.vue'
import InviteActivities from '@/pages/invite/InviteActivities.vue'

const routes = [
  // Page d'accueil -> InviteDashboard
  {
    path: '/',
    redirect: '/invite'
  },

  // Invite Routes (sans login)
  {
    path: '/invite',
    component: DashboardLayout,
    meta: { requiresAuth: false }, // pas besoin de login
    children: [
      { path: '', name: 'InviteDashboard', component: InviteDashboard },
      { path: 'activities', name: 'InviteActivities', component: InviteActivities }
    ]
  },

  // Catch-all redirect vers invite
  {
    path: '/:pathMatch(.*)*',
    redirect: '/invite'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard minimal (tout passe)
router.beforeEach((to, from, next) => {
  next()
})

export default router