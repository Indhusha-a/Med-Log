// Mirrors backend/app/schemas and backend/app/models/enums.py exactly.
// If the backend's contract changes, this is the one file to update.

export type UserRole = 'patient' | 'doctor' | 'admin'

export type AppointmentType =
  | 'consultation'
  | 'follow_up'
  | 'routine_checkup'
  | 'lab_review'
  | 'emergency'

export type AppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'no_show'
  | 'needs_rescheduling'
  | 'cancelled'

export type CancelledBy = 'patient' | 'doctor'

export const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'routine_checkup', label: 'Routine Checkup' },
  { value: 'lab_review', label: 'Lab Review' },
  { value: 'emergency', label: 'Emergency' },
]

export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
}

export interface Doctor {
  id: number
  doctor_id: string
  first_name: string
  last_name: string
  speciality: string
  consultation_rate: number
}

export interface TimeSlot {
  id: number
  doctor_id: number
  date: string // YYYY-MM-DD
  start_time: string // HH:MM:SS
  end_time: string
  is_booked: boolean
}

export interface Appointment {
  id: number
  appointment_type: AppointmentType
  status: AppointmentStatus
  cancelled_by: CancelledBy | null
  cancellation_reason: string | null
  created_at: string
  patient: Patient
  doctor: Doctor
  slot: TimeSlot
}

// ---- auth ----

export interface PatientSignupRequest {
  first_name: string
  last_name: string
  phone: string
  email: string
  password: string
  confirm_password: string
}

export interface LoginRequest {
  role: UserRole
  identifier: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  role: UserRole
  user_id: number
}

// ---- profile updates ----

export interface PatientUpdateRequest {
  first_name?: string
  last_name?: string
  phone?: string
  password?: string
}

export interface DoctorUpdateRequest {
  first_name?: string
  last_name?: string
  password?: string
}

export interface DoctorCreateRequest {
  doctor_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  speciality: string
  consultation_rate: number
  password: string
}

// ---- slots ----

export interface TimeSlotCreateRequest {
  date: string
  start_time: string
  end_time: string
}

// ---- appointments ----

export interface AppointmentCreateRequest {
  doctor_id: number
  slot_id: number
  appointment_type: AppointmentType
}

export interface AppointmentRescheduleRequest {
  doctor_id: number
  slot_id: number
}

export interface AppointmentCancelRequest {
  reason: string
}

export interface AppointmentResolveRequest {
  status: 'completed' | 'no_show' | 'needs_rescheduling'
}

export interface AppointmentFilterParams {
  status?: AppointmentStatus
  appointment_type?: AppointmentType
  doctor_id?: number
  date_from?: string
  date_to?: string
}

// ---- admin ----

export interface AdminUserRow {
  id: number
  role: UserRole
}

export interface HealthResponse {
  status: string
  database: string
}

// ---- ml-service ----

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  reply: string
  show_booking_cta: boolean
}

// A uniform shape this app's error handling normalizes every API failure into.
export interface ApiErrorShape {
  status: number | null
  message: string
}
