import axios from 'axios'
import { loadSession } from '@/utils/authStorage'
import { notifyUnauthorized } from '@/utils/authEvents'

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
  timeout: 10_000,
})

backendApi.interceptors.request.use((config) => {
  const session = loadSession()
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      notifyUnauthorized()
    }
    return Promise.reject(error)
  },
)
