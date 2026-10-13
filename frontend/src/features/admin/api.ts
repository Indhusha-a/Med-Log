import { backendApi } from '@/services/backendApi'
import type { AdminUserRow, DoctorCreateRequest, Doctor, HealthResponse, UserRole } from '@/types/api'

export function seedDoctor(data: DoctorCreateRequest) {
  return backendApi.post<Doctor>('/admin/doctors', data).then((r) => r.data)
}

export function listUsers(role?: UserRole) {
  return backendApi.get<AdminUserRow[]>('/admin/users', { params: role ? { role } : undefined }).then((r) => r.data)
}

export function getHealth() {
  return backendApi.get<HealthResponse>('/admin/health').then((r) => r.data)
}
