<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Activities</h1>
        <p class="text-muted-foreground mt-1">Manage all activities</p>
      </div>
      <router-link to="/admin/activities/create" class="btn btn-primary">
        <Plus class="w-4 h-4" />
        Add Activity
      </router-link>
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

    <!-- Activities Table -->
    <div class="card p-0 overflow-hidden">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Description</th>
              <th>Date</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-8">
                <Loader2 class="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </td>
            </tr>
            <tr v-else-if="filteredActivities.length === 0">
              <td colspan="4" class="text-center py-8 text-muted-foreground">
                No activities found
              </td>
            </tr>
            <tr v-else v-for="activity in filteredActivities" :key="activity.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar class="w-5 h-5 text-blue-500" />
                  </div>
                  <span class="font-medium">{{ activity.title || activity.nom }}</span>
                </div>
              </td>
              <td class="text-muted-foreground max-w-xs truncate">
                {{ activity.description || '-' }}
              </td>
              <td class="text-muted-foreground">
                {{ formatDate(activity.date) }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/activities/${activity.id}/edit`"
                    class="btn btn-ghost"
                  >
                    <Edit class="w-4 h-4" />
                  </router-link>
                  <button
                    @click="confirmDelete(activity)"
                    class="btn btn-ghost text-destructive hover:text-destructive"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="showDeleteModal = false" />
      <div class="relative card max-w-md w-full">
        <h3 class="text-lg font-semibold mb-2">Delete Activity</h3>
        <p class="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{{ activityToDelete?.title || activityToDelete?.nom }}</strong>? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="deleteActivity" class="btn btn-destructive" :disabled="deleting">
            <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activitiesAPI } from '@/services/api'
import { Plus, Search, Calendar, Edit, Trash2, Loader2 } from 'lucide-vue-next'

const loading = ref(true)
const activities = ref([])
const searchQuery = ref('')
const showDeleteModal = ref(false)
const activityToDelete = ref(null)
const deleting = ref(false)

const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const title = activity.title || activity.nom || ''
    return title.toLowerCase().includes(searchQuery.value.toLowerCase())
  })
})

function formatDate(date) {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function confirmDelete(activity) {
  activityToDelete.value = activity
  showDeleteModal.value = true
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

async function deleteActivity() {
  if (!activityToDelete.value) return
  
  deleting.value = true
  try {
    await activitiesAPI.delete(activityToDelete.value.id)
    activities.value = activities.value.filter(a => a.id !== activityToDelete.value.id)
    showDeleteModal.value = false
    activityToDelete.value = null
  } catch (error) {
    console.error('Failed to delete activity:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(fetchActivities)
</script>
