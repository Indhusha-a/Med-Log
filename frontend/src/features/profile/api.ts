import { backendApi } from '@/services/backendApi'
import type { Patient, PatientUpdateRequest } from '@/types/api'

export function getPatientMe() {
  return backendApi.get<Patient>('/patients/me').then((r) => r.data)
}

export function updatePatientMe(data: PatientUpdateRequest) {
  return backendApi.patch<Patient>('/patients/me', data).then((r) => r.data)
}
