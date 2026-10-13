import axios from 'axios'
import { loadSession } from '@/utils/authStorage'
import { notifyUnauthorized } from '@/utils/authEvents'

export const mlApi = axios.create({
  baseURL: import.meta.env.VITE_ML_SERVICE_URL ?? 'http://127.0.0.1:8010',
  timeout: 20_000, // the agent can take a few seconds longer than a plain CRUD call
})

mlApi.interceptors.request.use((config) => {
  const session = loadSession()
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      notifyUnauthorized()
    }
    return Promise.reject(error)
  },
)
