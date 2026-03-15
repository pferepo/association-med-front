import { reactive, computed } from 'vue'
import { authAPI } from '@/services/api'

const state = reactive({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
})

export function useAuth() {
  const isAuthenticated = computed(() => !!state.token)
  const user = computed(() => state.user)
  const userRole = computed(() => state.user?.role || null)
  const loading = computed(() => state.loading)
  const error = computed(() => state.error)

  const isAdmin = computed(() => state.user?.role === 'ADMIN')
  const isMembre = computed(() => state.user?.role === 'MEMBRE')
  const isInvite = computed(() => state.user?.role === 'INVITE')

  async function login(email, password) {
    state.loading = true
    state.error = null
    
    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data
      
      state.token = token
      state.user = user
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { success: true, user }
    } catch (err) {
      state.error = err.response?.data?.message || 'Login failed'
      return { success: false, error: state.error }
    } finally {
      state.loading = false
    }
  }

  function logout() {
    state.token = null
    state.user = null
    state.error = null
    authAPI.logout()
  }

  function clearError() {
    state.error = null
  }

  return {
    isAuthenticated,
    user,
    userRole,
    loading,
    error,
    isAdmin,
    isMembre,
    isInvite,
    login,
    logout,
    clearError
  }
}
