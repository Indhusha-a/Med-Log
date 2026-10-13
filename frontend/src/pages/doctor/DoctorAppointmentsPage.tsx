import { CalendarX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/app/ToastProvider'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRows } from '@/components/Skeleton'
import { listDoctorAppointments } from '@/features/appointments/api'
import { AppointmentFilters } from '@/features/appointments/AppointmentFilters'
import { AppointmentRow } from '@/features/appointments/AppointmentRow'
import { DoctorCancelModal } from '@/features/appointments/DoctorCancelModal'
import { ResolveModal } from '@/features/appointments/ResolveModal'
import type { Appointment, AppointmentFilterParams } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { isInsideLockWindow, lockWindowMessage, slotDateTime } from '@/utils/oneHourLock'

export function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilterParams>({})
  const [search, setSearch] = useState('')
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [resolveTarget, setResolveTarget] = useState<Appointment | null>(null)
  const { show } = useToast()

  function refresh() {
    setError(null)
    listDoctorAppointments(filters)
      .then(setAppointments)
      .catch((err) => setError(toApiError(err).message))
  }

  useEffect(refresh, [filters])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return appointments ?? []
    return (appointments ?? []).filter((a) => `${a.patient.first_name} ${a.patient.last_name}`.toLowerCase().includes(q))
  }, [appointments, search])

  const now = new Date()

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-text-primary">All appointments</h1>

      <AppointmentFilters filters={filters} onFiltersChange={setFilters} search={search} onSearchChange={setSearch} searchPlaceholder="Search by patient name" />

      {error && <p className="text-sm text-error">{error}</p>}

      {appointments === null ? (
        <SkeletonRows />
      ) : visible.length === 0 ? (
        <EmptyState icon={CalendarX} title="No appointments" description="Nothing matches these filters." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => {
            const isScheduled = a.status === 'scheduled'
            const locked = isInsideLockWindow(a.slot)
            const timePassed = slotDateTime(a.slot) <= now
            return (
              <AppointmentRow
                key={a.id}
                appointment={a}
                perspective="doctor"
                actions={
                  isScheduled ? (
                    timePassed ? (
                      <Button size="sm" onClick={() => setResolveTarget(a)}>
                        Resolve
                      </Button>
                    ) : (
                      <Button variant="danger" size="sm" disabled={locked} title={locked ? lockWindowMessage() : undefined} onClick={() => setCancelTarget(a)}>
                        Cancel
                      </Button>
                    )
                  ) : undefined
                }
              />
            )
          })}
        </div>
      )}

      <DoctorCancelModal
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={() => {
          setCancelTarget(null)
          show('success', 'Appointment cancelled.')
          refresh()
        }}
      />
      <ResolveModal
        appointment={resolveTarget}
        onClose={() => setResolveTarget(null)}
        onSuccess={() => {
          setResolveTarget(null)
          show('success', 'Appointment resolved.')
          refresh()
        }}
      />
    </div>
  )
}
