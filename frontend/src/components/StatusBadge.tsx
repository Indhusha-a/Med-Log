import type { AppointmentStatus } from '@/types/api'
import { statusMeta } from '@/utils/status'
import { cn } from '@/utils/cn'

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const meta = statusMeta(status)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', meta.badgeClass)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
