<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Activities</h1>
      <p class="text-muted-foreground mt-1">Browse activities available for guests</p>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search activities..."
          class="w-full pl-10"
        />
      </div>
    </div>

    <!-- Activities Grid -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="filteredActivities.length === 0" class="card text-center py-12">
      <Calendar class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No activities available for guests</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="activity in filteredActivities" 
        :key="activity.id"
        class="card"
        @click="showActivityDetails(activity)"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Calendar class="w-6 h-6 text-blue-500" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold truncate">{{ activity.title || activity.nom }}</h3>
            <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
              {{ activity.description || 'No description available' }}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-border">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-muted-foreground">
              <CalendarDays class="w-4 h-4" />
              {{ formatDate(activity.date) }}
            </div>
            <div v-if="activity.location || activity.lieu" class="flex items-center gap-2 text-muted-foreground">
              <MapPin class="w-4 h-4" />
              {{ activity.location || activity.lieu }}
            </div>
          </div>
        </div>

        <button class="btn btn-secondary w-full mt-4">
          <Eye class="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>

    <!-- Activity Details Modal -->
    <div v-if="selectedActivity" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="selectedActivity = null" />
      <div class="relative card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Calendar class="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 class="text-xl font-semibold">{{ selectedActivity.title || selectedActivity.nom }}</h3>
            <span class="badge badge-secondary mt-2">Guest Accessible</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-muted-foreground mb-1">Description</h4>
            <p>{{ selectedActivity.description || 'No description available' }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="text-sm font-medium text-muted-foreground mb-1">Date</h4>
              <div class="flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-muted-foreground" />
                {{ formatDate(selectedActivity.date) }}
              </div>
            </div>
            <div v-if="selectedActivity.location || selectedActivity.lieu">
              <h4 class="text-sm font-medium text-muted-foreground mb-1">Location</h4>
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-muted-foreground" />
                {{ selectedActivity.location || selectedActivity.lieu }}
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-border">
          <button @click="selectedActivity = null" class="btn btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activitiesAPI } from '@/services/api'
import { Search, Calendar, CalendarDays, MapPin, Eye, Loader2 } from 'lucide-vue-next'

const loading = ref(true)
const activities = ref([])
const searchQuery = ref('')
const selectedActivity = ref(null)

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const title = activity.title || activity.nom || ''
    return title.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function showActivityDetails(activity) {
  selectedActivity.value = activity
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
