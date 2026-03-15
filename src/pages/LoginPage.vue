<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-2xl font-bold">Welcome back</h1>
        <p class="text-muted-foreground mt-2">Sign in to your account to continue</p>
      </div>

      <!-- Login Form -->
      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Error Message -->
          <div v-if="error" class="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                class="w-full pl-10"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                class="w-full pl-10 pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full h-11"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span v-else>Sign in</span>
          </button>
        </form>
      </div>

      <!-- Demo Credentials -->
      <div class="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Demo Credentials</p>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Admin:</span>
            <code class="px-2 py-0.5 rounded bg-card text-xs">admin@example.com</code>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Member:</span>
            <code class="px-2 py-0.5 rounded bg-card text-xs">membre@example.com</code>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Guest:</span>
            <code class="px-2 py-0.5 rounded bg-card text-xs">invite@example.com</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { 
  LayoutDashboard, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const { login, loading, error, clearError } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  clearError()
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    const role = result.user?.role
    if (role === 'ADMIN') {
      router.push('/admin')
    } else if (role === 'MEMBRE') {
      router.push('/member')
    } else if (role === 'INVITE') {
      router.push('/invite')
    }
  }
}
</script>
