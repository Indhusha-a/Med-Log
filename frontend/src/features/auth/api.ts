import { backendApi } from '@/services/backendApi'
import type { LoginRequest, Patient, PatientSignupRequest, TokenResponse } from '@/types/api'

export function signup(data: PatientSignupRequest) {
  return backendApi.post<Patient>('/auth/signup', data).then((r) => r.data)
}

export function login(data: LoginRequest) {
  return backendApi.post<TokenResponse>('/auth/login', data).then((r) => r.data)
}
