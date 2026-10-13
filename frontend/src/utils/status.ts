import type { AppointmentStatus } from '@/types/api'

export interface StatusMeta {
  label: string
  // Tailwind utility classes - deliberately centralized here so no page
  // ever branches on the raw backend enum string to decide a color.
  badgeClass: string
  dotClass: string
}

const STATUS_MAP: Record<AppointmentStatus, StatusMeta> = {
  scheduled: {
    label: 'Scheduled',
    badgeClass: 'bg-info-bg text-info',
    dotClass: 'bg-info',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-success-bg text-success',
    dotClass: 'bg-success',
  },
  no_show: {
    label: 'No-show',
    badgeClass: 'bg-warning-bg text-warning',
    dotClass: 'bg-warning',
  },
  needs_rescheduling: {
    label: 'Needs rescheduling',
    badgeClass: 'bg-warning-bg text-warning',
    dotClass: 'bg-warning',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-error-bg text-error',
    dotClass: 'bg-error',
  },
}

export function statusMeta(status: AppointmentStatus): StatusMeta {
  return STATUS_MAP[status]
}
