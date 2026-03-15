<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Votes</h1>
      <p class="text-muted-foreground mt-1">Manage and close votes</p>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search votes..."
            class="w-full pl-10"
          />
        </div>
        <select v-model="statusFilter" class="w-full sm:w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>

    <!-- Votes Table -->
    <div class="card p-0 overflow-hidden">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Vote</th>
              <th>Description</th>
              <th>Status</th>
              <th>Results</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-8">
                <Loader2 class="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </td>
            </tr>
            <tr v-else-if="filteredVotes.length === 0">
              <td colspan="5" class="text-center py-8 text-muted-foreground">
                No votes found
              </td>
            </tr>
            <tr v-else v-for="vote in filteredVotes" :key="vote.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :class="isVoteClosed(vote) ? 'bg-muted' : 'bg-amber-500/10'">
                    <Vote class="w-5 h-5" :class="isVoteClosed(vote) ? 'text-muted-foreground' : 'text-amber-500'" />
                  </div>
                  <span class="font-medium">{{ vote.title || vote.sujet || `Vote #${vote.id}` }}</span>
                </div>
              </td>
              <td class="text-muted-foreground max-w-xs truncate">
                {{ vote.description || '-' }}
              </td>
              <td>
                <span :class="isVoteClosed(vote) ? 'badge-secondary' : 'badge-primary'" class="badge">
                  {{ isVoteClosed(vote) ? 'Closed' : 'Active' }}
                </span>
              </td>
              <td class="text-muted-foreground">
                <div class="flex items-center gap-4 text-sm">
                  <span class="flex items-center gap-1">
                    <ThumbsUp class="w-4 h-4 text-primary" />
                    {{ vote.votesOui || vote.yesVotes || 0 }}
                  </span>
                  <span class="flex items-center gap-1">
                    <ThumbsDown class="w-4 h-4 text-destructive" />
                    {{ vote.votesNon || vote.noVotes || 0 }}
                  </span>
                </div>
              </td>
              <td class="text-right">
                <button
                  v-if="!isVoteClosed(vote)"
                  @click="confirmClose(vote)"
                  class="btn btn-secondary"
                >
                  <Lock class="w-4 h-4" />
                  Close
                </button>
                <span v-else class="text-sm text-muted-foreground">Closed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Close Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="showCloseModal = false" />
      <div class="relative card max-w-md w-full">
        <h3 class="text-lg font-semibold mb-2">Close Vote</h3>
        <p class="text-muted-foreground mb-6">
          Are you sure you want to close <strong>{{ voteToClose?.title || voteToClose?.sujet }}</strong>? No more votes can be cast after closing.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showCloseModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="closeVote" class="btn btn-primary" :disabled="closing">
            <Loader2 v-if="closing" class="w-4 h-4 animate-spin" />
            <span v-else>Close Vote</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { votesAPI } from '@/services/api'
import { Search, Vote, ThumbsUp, ThumbsDown, Lock, Loader2 } from 'lucide-vue-next'

const loading = ref(true)
const votes = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const showCloseModal = ref(false)
const voteToClose = ref(null)
const closing = ref(false)

const filteredVotes = computed(() => {
  return votes.value.filter(vote => {
    const title = vote.title || vote.sujet || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter.value === 'active') {
      matchesStatus = !isVoteClosed(vote)
    } else if (statusFilter.value === 'closed') {
      matchesStatus = isVoteClosed(vote)
    }
    
    return matchesSearch && matchesStatus
  })
})

function isVoteClosed(vote) {
  return vote.closed || vote.cloture
}

function confirmClose(vote) {
  voteToClose.value = vote
  showCloseModal.value = true
}

async function fetchVotes() {
  loading.value = true
  try {
    const response = await votesAPI.getAll()
    votes.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch votes:', error)
  } finally {
    loading.value = false
  }
}

async function closeVote() {
  if (!voteToClose.value) return
  
  closing.value = true
  try {
    await votesAPI.close(voteToClose.value.id)
    const index = votes.value.findIndex(v => v.id === voteToClose.value.id)
    if (index !== -1) {
      votes.value[index] = { ...votes.value[index], closed: true, cloture: true }
    }
    showCloseModal.value = false
    voteToClose.value = null
  } catch (error) {
    console.error('Failed to close vote:', error)
  } finally {
    closing.value = false
  }
}

onMounted(fetchVotes)
</script>
