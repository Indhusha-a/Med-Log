import { backendApi } from '@/services/backendApi'
import type { Doctor, TimeSlot, TimeSlotCreateRequest } from '@/types/api'

export function listDoctors() {
  return backendApi.get<Doctor[]>('/doctors').then((r) => r.data)
}

export function getDoctorMe() {
  return backendApi.get<Doctor>('/doctors/me').then((r) => r.data)
}

export function updateDoctorMe(data: { first_name?: string; last_name?: string; password?: string }) {
  return backendApi.patch<Doctor>('/doctors/me', data).then((r) => r.data)
}

export function getDoctorSlots(doctorId: number, onDate?: string) {
  return backendApi
    .get<TimeSlot[]>(`/doctors/${doctorId}/slots`, { params: onDate ? { on_date: onDate } : undefined })
    .then((r) => r.data)
}

export function createSlot(data: TimeSlotCreateRequest) {
  return backendApi.post<TimeSlot>('/slots', data).then((r) => r.data)
}
