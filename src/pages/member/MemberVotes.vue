<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold">Votes</h1>
      <p class="text-muted-foreground mt-1">Cast your vote on active polls</p>
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
          <option value="">All Votes</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>

    <!-- Votes Grid -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="filteredVotes.length === 0" class="card text-center py-12">
      <Vote class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <p class="text-muted-foreground">No votes found</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div 
        v-for="vote in filteredVotes" 
        :key="vote.id"
        class="card"
      >
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex items-start gap-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="isVoteClosed(vote) ? 'bg-muted' : 'bg-amber-500/10'"
            >
              <Vote 
                class="w-5 h-5" 
                :class="isVoteClosed(vote) ? 'text-muted-foreground' : 'text-amber-500'" 
              />
            </div>
            <div>
              <h3 class="font-semibold">{{ vote.title || vote.sujet || `Vote #${vote.id}` }}</h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ vote.description || 'No description' }}
              </p>
            </div>
          </div>
          <span :class="isVoteClosed(vote) ? 'badge-secondary' : 'badge-primary'" class="badge flex-shrink-0">
            {{ isVoteClosed(vote) ? 'Closed' : 'Active' }}
          </span>
        </div>

        <!-- Results Bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="flex items-center gap-1">
              <ThumbsUp class="w-4 h-4 text-primary" />
              Yes: {{ vote.votesOui || vote.yesVotes || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <ThumbsDown class="w-4 h-4 text-destructive" />
              No: {{ vote.votesNon || vote.noVotes || 0 }}
            </span>
          </div>
          <div class="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all"
              :style="{ width: getYesPercentage(vote) + '%' }"
            />
          </div>
        </div>

        <!-- Voting Buttons -->
        <div v-if="!isVoteClosed(vote)" class="flex gap-3">
          <button
            @click="castVote(vote, true)"
            :disabled="votingId === vote.id"
            class="btn btn-primary flex-1"
          >
            <Loader2 v-if="votingId === vote.id && votingChoice === true" class="w-4 h-4 animate-spin" />
            <template v-else>
              <ThumbsUp class="w-4 h-4" />
              Yes
            </template>
          </button>
          <button
            @click="castVote(vote, false)"
            :disabled="votingId === vote.id"
            class="btn btn-destructive flex-1"
          >
            <Loader2 v-if="votingId === vote.id && votingChoice === false" class="w-4 h-4 animate-spin" />
            <template v-else>
              <ThumbsDown class="w-4 h-4" />
              No
            </template>
          </button>
        </div>

        <div v-else class="text-center py-2 text-sm text-muted-foreground">
          This vote has been closed
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div 
      v-if="showSuccessToast" 
      class="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
    >
      <CheckCircle class="w-5 h-5" />
      Vote submitted successfully!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { votesAPI } from '@/services/api'
import { 
  Search, 
  Vote, 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  CheckCircle
} from 'lucide-vue-next'

const loading = ref(true)
const votes = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const votingId = ref(null)
const votingChoice = ref(null)
const showSuccessToast = ref(false)

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

function getYesPercentage(vote) {
  const yes = vote.votesOui || vote.yesVotes || 0
  const no = vote.votesNon || vote.noVotes || 0
  const total = yes + no
  if (total === 0) return 50
  return Math.round((yes / total) * 100)
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

async function castVote(vote, choice) {
  votingId.value = vote.id
  votingChoice.value = choice
  
  try {
    await votesAPI.participate(vote.id, { 
      vote: choice,
      choix: choice ? 'OUI' : 'NON'
    })
    
    // Update local state
    const index = votes.value.findIndex(v => v.id === vote.id)
    if (index !== -1) {
      if (choice) {
        votes.value[index].votesOui = (votes.value[index].votesOui || 0) + 1
        votes.value[index].yesVotes = (votes.value[index].yesVotes || 0) + 1
      } else {
        votes.value[index].votesNon = (votes.value[index].votesNon || 0) + 1
        votes.value[index].noVotes = (votes.value[index].noVotes || 0) + 1
      }
    }
    
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  } catch (error) {
    console.error('Failed to cast vote:', error)
  } finally {
    votingId.value = null
    votingChoice.value = null
  }
}

onMounted(fetchVotes)
</script>
