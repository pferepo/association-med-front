import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// Users API (Admin)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users/register', userData),
  delete: (id) => api.delete(`/users/${id}`)
}

// Activities API
export const activitiesAPI = {
  getAll: () => api.get('/activites'),
  getById: (id) => api.get(`/activites/${id}`),
  create: (activityData) => api.post('/activites', activityData),
  update: (id, activityData) => api.put(`/activites/${id}`, activityData),
  delete: (id) => api.delete(`/activites/${id}`),
  getForGuests: () => api.get('/activites/invite')
}

// Participations API
export const participationsAPI = {
  create: (participationData) => api.post('/participations', participationData)
}

// Votes API
export const votesAPI = {
  getAll: () => api.get('/votes'),
  getById: (id) => api.get(`/votes/${id}`),
  participate: (voteId, voteData) => api.post(`/votes/${voteId}/participer`, voteData),
  close: (id) => api.put(`/votes/${id}/close`)
}

export default api
