<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0"
      :class="{ '-translate-x-full': !sidebarOpen, 'translate-x-0': sidebarOpen }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard class="w-5 h-5 text-primary-foreground" />
          </div>
          <span class="font-semibold text-lg">Dashboard</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div v-for="section in navigationItems" :key="section.title" class="mb-6">
            <p class="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {{ section.title }}
            </p>
            <router-link
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="[
                isActiveRoute(item.path) 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </router-link>
          </div>
        </nav>

        <!-- User Info -->
        <div class="p-4 border-t border-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ user?.name || user?.email || 'User' }}</p>
              <p class="text-xs text-muted-foreground">{{ userRole }}</p>
            </div>
            <button 
              @click="handleLogout" 
              class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Logout"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 lg:ml-64">
      <!-- Header -->
      <header class="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
        <div class="flex items-center justify-between h-full px-4 lg:px-6">
          <button 
            @click="sidebarOpen = !sidebarOpen" 
            class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary lg:hidden"
          >
            <Menu class="w-5 h-5" />
          </button>
          
          <div class="flex items-center gap-4 ml-auto">
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm">
              <div class="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span class="text-muted-foreground">Connected</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Vote, 
  User, 
  LogOut, 
  Menu,
  Activity,
  Eye
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { user, userRole, logout, isAdmin, isMembre, isInvite } = useAuth()

const sidebarOpen = ref(false)

const adminNavigation = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Management',
    items: [
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Activities', path: '/admin/activities', icon: Calendar },
      { label: 'Votes', path: '/admin/votes', icon: Vote }
    ]
  }
]

const memberNavigation = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/member', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Actions',
    items: [
      { label: 'Activities', path: '/member/activities', icon: Activity },
      { label: 'Votes', path: '/member/votes', icon: Vote }
    ]
  }
]

const inviteNavigation = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/invite', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Browse',
    items: [
      { label: 'Activities', path: '/invite/activities', icon: Eye }
    ]
  }
]

const navigationItems = computed(() => {
  if (isAdmin.value) return adminNavigation
  if (isMembre.value) return memberNavigation
  if (isInvite.value) return inviteNavigation
  return []
})

function isActiveRoute(path) {
  if (path === '/admin' || path === '/member' || path === '/invite') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
