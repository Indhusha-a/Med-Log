import { History } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRows } from '@/components/Skeleton'
import { listMyAppointments } from '@/features/appointments/api'
import { AppointmentFilters } from '@/features/appointments/AppointmentFilters'
import { AppointmentRow } from '@/features/appointments/AppointmentRow'
import type { Appointment, AppointmentFilterParams } from '@/types/api'
import { toApiError } from '@/utils/apiError'

const PAST_STATUSES = new Set(['completed', 'no_show', 'cancelled'])

export function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilterParams>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    setError(null)
    listMyAppointments(filters)
      .then(setAppointments)
      .catch((err) => setError(toApiError(err).message))
  }, [filters])

  const visible = useMemo(() => {
    const past = (appointments ?? []).filter((a) => PAST_STATUSES.has(a.status))
    const q = search.trim().toLowerCase()
    if (!q) return past
    return past.filter((a) => `${a.doctor.first_name} ${a.doctor.last_name}`.toLowerCase().includes(q))
  }, [appointments, search])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Appointment history</h1>

      <AppointmentFilters filters={filters} onFiltersChange={setFilters} search={search} onSearchChange={setSearch} searchPlaceholder="Search by doctor name" />

      {error && <p className="text-sm text-error">{error}</p>}

      {appointments === null ? (
        <SkeletonRows />
      ) : visible.length === 0 ? (
        <EmptyState icon={History} title="No history yet" description="Past appointments will show up here once resolved." />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => (
            <AppointmentRow key={a.id} appointment={a} perspective="patient" />
          ))}
        </div>
      )}
    </div>
  )
}
