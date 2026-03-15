<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Users</h1>
        <p class="text-muted-foreground mt-1">Manage all users in the system</p>
      </div>
      <router-link to="/admin/users/create" class="btn btn-primary">
        <Plus class="w-4 h-4" />
        Add User
      </router-link>
    </div>

    <!-- Search & Filters -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full pl-10"
          />
        </div>
        <select v-model="roleFilter" class="w-full sm:w-40">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBRE">Member</option>
          <option value="INVITE">Guest</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card p-0 overflow-hidden">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="4" class="text-center py-8">
                <Loader2 class="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="4" class="text-center py-8 text-muted-foreground">
                No users found
              </td>
            </tr>
            <tr v-else v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User class="w-5 h-5 text-primary" />
                  </div>
                  <span class="font-medium">{{ user.name || 'Unknown' }}</span>
                </div>
              </td>
              <td class="text-muted-foreground">{{ user.email }}</td>
              <td>
                <span :class="getRoleBadgeClass(user.role)" class="badge">
                  {{ user.role }}
                </span>
              </td>
              <td class="text-right">
                <button
                  @click="confirmDelete(user)"
                  class="btn btn-ghost text-destructive hover:text-destructive"
                  :disabled="user.role === 'ADMIN'"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
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
        <h3 class="text-lg font-semibold mb-2">Delete User</h3>
        <p class="text-muted-foreground mb-6">
          Are you sure you want to delete <strong>{{ userToDelete?.name || userToDelete?.email }}</strong>? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="deleteUser" class="btn btn-destructive" :disabled="deleting">
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
import { usersAPI } from '@/services/api'
import { Plus, Search, User, Trash2, Loader2 } from 'lucide-vue-next'

const loading = ref(true)
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

function getRoleBadgeClass(role) {
  switch (role) {
    case 'ADMIN': return 'badge-primary'
    case 'MEMBRE': return 'badge-secondary'
    case 'INVITE': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function fetchUsers() {
  loading.value = true
  try {
    const response = await usersAPI.getAll()
    users.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

async function deleteUser() {
  if (!userToDelete.value) return
  
  deleting.value = true
  try {
    await usersAPI.delete(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Failed to delete user:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(fetchUsers)
</script>
