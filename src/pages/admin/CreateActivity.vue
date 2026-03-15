<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <router-link to="/admin/activities" class="btn btn-ghost">
        <ArrowLeft class="w-4 h-4" />
      </router-link>
      <div>
        <h1 class="text-2xl font-bold">Create Activity</h1>
        <p class="text-muted-foreground mt-1">Add a new activity</p>
      </div>
    </div>

    <!-- Form -->
    <div class="card max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Error Message -->
        <div v-if="error" class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          {{ error }}
        </div>

        <!-- Title Field -->
        <div class="space-y-2">
          <label for="title" class="block text-sm font-medium">Title</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="Enter activity title"
            required
            class="w-full"
          />
        </div>

        <!-- Description Field -->
        <div class="space-y-2">
          <label for="description" class="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Enter activity description"
            rows="4"
            class="w-full resize-none"
          />
        </div>

        <!-- Date Field -->
        <div class="space-y-2">
          <label for="date" class="block text-sm font-medium">Date</label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            required
            class="w-full"
          />
        </div>

        <!-- Location Field -->
        <div class="space-y-2">
          <label for="location" class="block text-sm font-medium">Location</label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            placeholder="Enter location"
            class="w-full"
          />
        </div>

        <!-- Guest Accessible -->
        <div class="flex items-center gap-3">
          <input
            id="guestAccessible"
            v-model="form.guestAccessible"
            type="checkbox"
            class="w-4 h-4 rounded border-border"
          />
          <label for="guestAccessible" class="text-sm font-medium">
            Allow guest access
          </label>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-3 pt-4">
          <router-link to="/admin/activities" class="btn btn-secondary">
            Cancel
          </router-link>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span v-else>Create Activity</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { activitiesAPI } from '@/services/api'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  date: '',
  location: '',
  guestAccessible: false
})

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    await activitiesAPI.create({
      nom: form.title,
      title: form.title,
      description: form.description,
      date: form.date,
      lieu: form.location,
      location: form.location,
      accessibleInvite: form.guestAccessible
    })
    router.push('/admin/activities')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create activity'
  } finally {
    loading.value = false
  }
}
</script>
