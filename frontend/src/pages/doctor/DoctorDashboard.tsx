import { CalendarClock, CheckCircle2, ListChecks } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/app/ToastProvider'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRows } from '@/components/Skeleton'
import { listDoctorAppointments } from '@/features/appointments/api'
import { AppointmentRow } from '@/features/appointments/AppointmentRow'
import { ResolveModal } from '@/features/appointments/ResolveModal'
import { getDoctorMe } from '@/features/doctors/api'
import type { Appointment, Doctor } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { todayIso } from '@/utils/dates'
import { slotDateTime } from '@/utils/oneHourLock'
import { Button } from '@/components/Button'

export function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resolveTarget, setResolveTarget] = useState<Appointment | null>(null)
  const { show } = useToast()

  function refresh() {
    setError(null)
    listDoctorAppointments({ date_from: todayIso(), date_to: todayIso() })
      .then(setAppointments)
      .catch((err) => setError(toApiError(err).message))
  }

  useEffect(() => {
    getDoctorMe().then(setDoctor).catch(() => undefined)
    refresh()
  }, [])

  const now = new Date()
  const past = appointments?.filter((a) => a.status === 'scheduled' && slotDateTime(a.slot) <= now) ?? []
  const upcomingToday = appointments?.filter((a) => a.status === 'scheduled' && slotDateTime(a.slot) > now) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          {doctor ? `Good day, Dr. ${doctor.last_name}.` : 'Welcome back.'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Here's today's schedule.</p>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={ListChecks} label="Appointments today" value={appointments ? appointments.length : null} />
        <SummaryCard icon={CalendarClock} label="Remaining today" value={appointments ? upcomingToday.length : null} />
        <SummaryCard icon={CheckCircle2} label="Awaiting resolution" value={appointments ? past.length : null} />
      </div>

      {past.length > 0 && (
        <Card>
          <h2 className="font-display text-base font-semibold text-text-primary">Needs resolution</h2>
          <p className="mt-1 text-sm text-text-secondary">These appointments' time has passed but haven't been marked yet.</p>
          <div className="mt-4 flex flex-col gap-3">
            {past.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                perspective="doctor"
                actions={
                  <Button size="sm" onClick={() => setResolveTarget(a)}>
                    Resolve
                  </Button>
                }
              />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-base font-semibold text-text-primary">Today's appointments</h2>
        <div className="mt-4">
          {appointments === null ? (
            <SkeletonRows />
          ) : appointments.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled today" description="Enjoy the quiet — or add more availability." />
          ) : (
            <div className="flex flex-col gap-3">
              {appointments.map((a) => (
                <AppointmentRow key={a.id} appointment={a} perspective="doctor" />
              ))}
            </div>
          )}
        </div>
      </Card>

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

function SummaryCard({ icon: Icon, label, value }: { icon: typeof ListChecks; label: string; value: number | null }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-soft text-blue-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-text-primary">{value ?? '–'}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </Card>
  )
}
