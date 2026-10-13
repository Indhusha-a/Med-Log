import { backendApi } from '@/services/backendApi'
import type {
  Appointment,
  AppointmentCancelRequest,
  AppointmentCreateRequest,
  AppointmentFilterParams,
  AppointmentRescheduleRequest,
  AppointmentResolveRequest,
} from '@/types/api'

export function createAppointment(data: AppointmentCreateRequest) {
  return backendApi.post<Appointment>('/appointments', data).then((r) => r.data)
}

export function listMyAppointments(filters: AppointmentFilterParams = {}) {
  return backendApi.get<Appointment[]>('/appointments/me', { params: filters }).then((r) => r.data)
}

export function rescheduleAppointment(id: number, data: AppointmentRescheduleRequest) {
  return backendApi.patch<Appointment>(`/appointments/${id}`, data).then((r) => r.data)
}

export function cancelMyAppointment(id: number) {
  return backendApi.delete<Appointment>(`/appointments/${id}`).then((r) => r.data)
}

export function listDoctorAppointments(filters: AppointmentFilterParams = {}) {
  return backendApi.get<Appointment[]>('/appointments/doctor/mine', { params: filters }).then((r) => r.data)
}

export function doctorCancelAppointment(id: number, data: AppointmentCancelRequest) {
  return backendApi.post<Appointment>(`/appointments/${id}/cancel`, data).then((r) => r.data)
}

export function resolveAppointment(id: number, data: AppointmentResolveRequest) {
  return backendApi.post<Appointment>(`/appointments/${id}/resolve`, data).then((r) => r.data)
}
