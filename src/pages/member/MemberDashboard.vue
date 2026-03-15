<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Welcome back!</h1>
      <p class="text-muted-foreground mt-1">View activities and participate in votes</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">My Participations</p>
            <p class="text-2xl font-bold">{{ stats.participations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upcoming Activities -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Upcoming Activities</h2>
          <router-link to="/member/activities" class="text-sm text-primary hover:underline">
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="upcomingActivities.length === 0" class="text-center py-8 text-muted-foreground">
            No upcoming activities
          </div>
          <div 
            v-else
            v-for="activity in upcomingActivities" 
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

      <!-- Open Votes -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Open Votes</h2>
          <router-link to="/member/votes" class="text-sm text-primary hover:underline">
            View all
          </router-link>
        </div>
        <div class="space-y-3">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <div v-else-if="openVotes.length === 0" class="text-center py-8 text-muted-foreground">
            No open votes
          </div>
          <div 
            v-else
            v-for="vote in openVotes" 
            :key="vote.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
          >
            <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Vote class="w-5 h-5 text-amber-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ vote.title || vote.sujet || `Vote #${vote.id}` }}</p>
              <p class="text-xs text-muted-foreground">Vote now!</p>
            </div>
            <router-link to="/member/votes" class="btn btn-primary btn-sm text-xs px-3 py-1">
              Vote
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { activitiesAPI, votesAPI } from '@/services/api'
import { Calendar, Vote, CheckCircle, Loader2 } from 'lucide-vue-next'

const loading = ref(true)
const stats = ref({
  activities: 0,
  activeVotes: 0,
  participations: 0
})
const upcomingActivities = ref([])
const openVotes = ref([])

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
    const [activitiesRes, votesRes] = await Promise.all([
      activitiesAPI.getAll().catch(() => ({ data: [] })),
      votesAPI.getAll().catch(() => ({ data: [] }))
    ])

    const activities = activitiesRes.data || []
    const votes = votesRes.data || []
    const activeVotesList = votes.filter(v => !v.closed && !v.cloture)

    stats.value = {
      activities: activities.length,
      activeVotes: activeVotesList.length,
      participations: 0 // This would come from a real API
    }

    upcomingActivities.value = activities.slice(0, 4)
    openVotes.value = activeVotesList.slice(0, 4)
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
