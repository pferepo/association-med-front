<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <router-link to="/admin/users" class="btn btn-ghost">
        <ArrowLeft class="w-4 h-4" />
      </router-link>
      <div>
        <h1 class="text-2xl font-bold">Create User</h1>
        <p class="text-muted-foreground mt-1">Add a new user to the system</p>
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

        <!-- Name Field -->
        <div class="space-y-2">
          <label for="name" class="block text-sm font-medium">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter user name"
            required
            class="w-full"
          />
        </div>

        <!-- Email Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter email address"
            required
            class="w-full"
          />
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            required
            class="w-full"
          />
        </div>

        <!-- Role Field -->
        <div class="space-y-2">
          <label for="role" class="block text-sm font-medium">Role</label>
          <select id="role" v-model="form.role" required class="w-full">
            <option value="">Select a role</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBRE">Member</option>
            <option value="INVITE">Guest</option>
          </select>
        </div>

        <!-- Submit -->
        <div class="flex justify-end gap-3 pt-4">
          <router-link to="/admin/users" class="btn btn-secondary">
            Cancel
          </router-link>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span v-else>Create User</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usersAPI } from '@/services/api'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: ''
})

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    await usersAPI.create(form)
    router.push('/admin/users')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create user'
  } finally {
    loading.value = false
  }
}
</script>
