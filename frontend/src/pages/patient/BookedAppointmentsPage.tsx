import { CalendarX, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/app/ToastProvider'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRows } from '@/components/Skeleton'
import { cancelMyAppointment, listMyAppointments } from '@/features/appointments/api'
import { AppointmentFilters } from '@/features/appointments/AppointmentFilters'
import { AppointmentRow } from '@/features/appointments/AppointmentRow'
import { RescheduleModal } from '@/features/appointments/RescheduleModal'
import type { Appointment, AppointmentFilterParams } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { isInsideLockWindow, lockWindowMessage } from '@/utils/oneHourLock'

export function BookedAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilterParams>({})
  const [search, setSearch] = useState('')
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const { show } = useToast()

  function refresh() {
    setError(null)
    listMyAppointments(filters)
      .then(setAppointments)
      .catch((err) => setError(toApiError(err).message))
  }

  useEffect(refresh, [filters])

  const visible = useMemo(() => {
    const active = (appointments ?? []).filter((a) => a.status === 'scheduled' || a.status === 'needs_rescheduling')
    // Most recently booked first - this is a deliberately different order
    // from the dashboard's "next appointment" pick, which stays sorted by
    // appointment date since that one needs the soonest, not the newest.
    const sorted = [...active].sort((a, b) => b.created_at.localeCompare(a.created_at))
    const q = search.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((a) => `${a.doctor.first_name} ${a.doctor.last_name}`.toLowerCase().includes(q))
  }, [appointments, search])

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError(null)
    try {
      await cancelMyAppointment(cancelTarget.id)
      setCancelTarget(null)
      show('success', 'Appointment cancelled.')
      refresh()
    } catch (err) {
      setCancelError(toApiError(err).message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Booked appointments</h1>

      <AppointmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by doctor name"
      />

      {error && <p className="text-sm text-error">{error}</p>}

      {appointments === null ? (
        <SkeletonRows />
      ) : visible.length === 0 ? (
        <EmptyState icon={CalendarX} title="No booked appointments" description="Nothing matches these filters right now." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => {
            const locked = isInsideLockWindow(a.slot)
            return (
              <AppointmentRow
                key={a.id}
                appointment={a}
                perspective="patient"
                actions={
                  <>
                    <Button variant="ghost" size="sm" disabled={locked} title={locked ? lockWindowMessage() : undefined} onClick={() => setRescheduleTarget(a)}>
                      <Pencil className="h-3.5 w-3.5" /> Change
                    </Button>
                    <Button variant="danger" size="sm" disabled={locked} title={locked ? lockWindowMessage() : undefined} onClick={() => setCancelTarget(a)}>
                      <Trash2 className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </>
                }
              />
            )
          })}
        </div>
      )}

      <RescheduleModal
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={() => {
          setRescheduleTarget(null)
          show('success', 'Appointment updated.')
          refresh()
        }}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this appointment?"
        danger
        confirmLabel="Cancel appointment"
        loading={cancelling}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
        description={
          cancelTarget && (
            <p>
              You're about to cancel the appointment with Dr. {cancelTarget.doctor.first_name} {cancelTarget.doctor.last_name} on{' '}
              {cancelTarget.slot.date} at {cancelTarget.slot.start_time.slice(0, 5)}. This can't be undone, and isn't allowed within
              one hour of the appointment time.
            </p>
          )
        }
      />
    </div>
  )
}
