<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Welcome, Guest!</h1>
      <p class="text-muted-foreground mt-1">Browse activities available for guests</p>
    </div>

    <!-- Stats -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Eye class="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Available Activities</p>
          <p class="text-2xl font-bold">{{ activities.length }}</p>
        </div>
      </div>
    </div>

    <!-- Activities Preview -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Guest Activities</h2>
        <router-link to="/invite/activities" class="text-sm text-primary hover:underline">
          View all
        </router-link>
      </div>
      
      <div v-if="loading" class="flex items-center justify-center py-8">
        <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
      
      <div v-else-if="activities.length === 0" class="text-center py-8 text-muted-foreground">
        <Calendar class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No activities available for guests at this time</p>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="activity in activities.slice(0, 5)" 
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

    <!-- Info Card -->
    <div class="card bg-primary/5 border-primary/20">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Info class="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 class="font-semibold">Guest Access</h3>
          <p class="text-sm text-muted-foreground mt-1">
            As a guest, you can view activities that are marked as guest-accessible. 
            To participate in activities or vote, please contact an administrator to upgrade your account.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { activitiesAPI } from '@/services/api'
import { Eye, Calendar, Loader2, Info } from 'lucide-vue-next'

const loading = ref(true)
const activities = ref([])

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function fetchActivities() {
  loading.value = true
  try {
    const response = await activitiesAPI.getForGuests()
    activities.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch activities:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchActivities)
</script>
