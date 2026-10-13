import { Clock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/Avatar'
import { StatusBadge } from '@/components/StatusBadge'
import type { Appointment } from '@/types/api'
import { APPOINTMENT_TYPES } from '@/types/api'

function typeLabel(value: Appointment['appointment_type']): string {
  return APPOINTMENT_TYPES.find((t) => t.value === value)?.label ?? value
}

interface AppointmentRowProps {
  appointment: Appointment
  perspective: 'patient' | 'doctor'
  actions?: ReactNode
}

export function AppointmentRow({ appointment, perspective, actions }: AppointmentRowProps) {
  const counterpart =
    perspective === 'patient'
      ? { name: `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`, sub: appointment.doctor.speciality }
      : { name: `${appointment.patient.first_name} ${appointment.patient.last_name}`, sub: appointment.patient.phone }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Avatar firstName={counterpart.name.replace('Dr. ', '').split(' ')[0] ?? 'A'} lastName={counterpart.name.split(' ').at(-1) ?? 'B'} />
        <div>
          <p className="text-sm font-medium text-text-primary">{counterpart.name}</p>
          <p className="text-xs text-text-muted">{counterpart.sub}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary sm:flex-1 sm:justify-center">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-text-muted" />
          {appointment.slot.date} · {appointment.slot.start_time.slice(0, 5)}
        </span>
        <span className="rounded-full bg-app-bg-2 px-2.5 py-1 text-xs font-medium text-text-secondary">
          {typeLabel(appointment.appointment_type)}
        </span>
        <StatusBadge status={appointment.status} />
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
