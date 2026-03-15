<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Overview of your application statistics</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users class="w-6 h-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Total Users</p>
            <p class="text-2xl font-bold">{{ stats.users }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Calendar class="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Activities</p>
            <p class="text-2xl font-bold">{{ stats.activities }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Vote class="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Active Votes</p>
            <p class="text-2xl font-bold">{{ stats.activeVotes }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">Closed Votes</p>
            <p class="text-2xl font-bold">{{ stats.closedVotes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Users -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Recent Users</h2>
          <router-link to="/admin/users" class="text-sm text-primary hover:underline">
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="recentUsers.length === 0" class="text-center py-8 text-muted-foreground">
            No users found
          </div>
          <div 
            v-else
            v-for="user in recentUsers" 
            :key="user.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ user.name || user.email }}</p>
              <p class="text-xs text-muted-foreground">{{ user.email }}</p>
            </div>
            <span :class="getRoleBadgeClass(user.role)" class="badge">
              {{ user.role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Recent Activities</h2>
          <router-link to="/admin/activities" class="text-sm text-primary hover:underline">
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="recentActivities.length === 0" class="text-center py-8 text-muted-foreground">
            No activities found
          </div>
          <div 
            v-else
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar class="w-5 h-5 text-blue-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ activity.title || activity.nom }}</p>
              <p class="text-xs text-muted-foreground">{{ formatDate(activity.date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usersAPI, activitiesAPI, votesAPI } from '@/services/api'
import { 
  Users, 
  Calendar, 
  Vote, 
  CheckCircle,
  User,
  Loader2
} from 'lucide-vue-next'

const loading = ref(true)
const stats = ref({
  users: 0,
  activities: 0,
  activeVotes: 0,
  closedVotes: 0
})
const recentUsers = ref([])
const recentActivities = ref([])

function getRoleBadgeClass(role) {
  switch (role) {
    case 'ADMIN': return 'badge-primary'
    case 'MEMBRE': return 'badge-secondary'
    case 'INVITE': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function fetchData() {
  loading.value = true
  try {
    const [usersRes, activitiesRes, votesRes] = await Promise.all([
      usersAPI.getAll().catch(() => ({ data: [] })),
      activitiesAPI.getAll().catch(() => ({ data: [] })),
      votesAPI.getAll().catch(() => ({ data: [] }))
    ])

    const users = usersRes.data || []
    const activities = activitiesRes.data || []
    const votes = votesRes.data || []

    stats.value = {
      users: users.length,
      activities: activities.length,
      activeVotes: votes.filter(v => !v.closed && !v.cloture).length,
      closedVotes: votes.filter(v => v.closed || v.cloture).length
    }

    recentUsers.value = users.slice(0, 5)
    recentActivities.value = activities.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
