<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Activities</h1>
      <p class="text-muted-foreground mt-1">Browse and participate in activities</p>
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
      <p class="text-muted-foreground">No activities found</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="activity in filteredActivities" 
        :key="activity.id"
        class="card hover:border-primary/50 transition-colors"
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

        <button
          @click="participate(activity)"
          :disabled="participatingId === activity.id"
          class="btn btn-primary w-full mt-4"
        >
          <Loader2 v-if="participatingId === activity.id" class="w-4 h-4 animate-spin" />
          <template v-else>
            <UserPlus class="w-4 h-4" />
            Participate
          </template>
        </button>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showSuccessToast" 
      class="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
    >
      <CheckCircle class="w-5 h-5" />
      Successfully registered for activity!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activitiesAPI, participationsAPI } from '@/services/api'
import { 
  Search, 
  Calendar, 
  CalendarDays, 
  MapPin, 
  UserPlus, 
  Loader2,
  CheckCircle
} from 'lucide-vue-next'

const loading = ref(true)
const activities = ref([])
const searchQuery = ref('')
const participatingId = ref(null)
const showSuccessToast = ref(false)

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const title = activity.title || activity.nom || ''
    return title.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function fetchActivities() {
  loading.value = true
  try {
    const response = await activitiesAPI.getAll()
    activities.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch activities:', error)
  } finally {
    loading.value = false
  }
}

async function participate(activity) {
  participatingId.value = activity.id
  try {
    await participationsAPI.create({
      activityId: activity.id,
      activiteId: activity.id
    })
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to participate:', error)
  } finally {
    participatingId.value = null
  }
}

onMounted(fetchActivities)
</script>
