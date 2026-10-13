import { motion } from 'framer-motion'
import { CalendarCheck, CalendarPlus, CircleAlert, Clock3, History } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRows } from '@/components/Skeleton'
import { listMyAppointments } from '@/features/appointments/api'
import { AppointmentRow } from '@/features/appointments/AppointmentRow'
import { getPatientMe } from '@/features/profile/api'
import type { Appointment, Patient } from '@/types/api'
import { toApiError } from '@/utils/apiError'

export function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPatientMe(), listMyAppointments()])
      .then(([p, appts]) => {
        setPatient(p)
        setAppointments(appts)
      })
      .catch((err) => setError(toApiError(err).message))
  }, [])

  const upcoming = appointments?.filter((a) => a.status === 'scheduled') ?? []
  const needsRescheduling = appointments?.filter((a) => a.status === 'needs_rescheduling') ?? []
  const completed = appointments?.filter((a) => a.status === 'completed') ?? []
  const next = [...upcoming].sort((a, b) => a.slot.date.localeCompare(b.slot.date) || a.slot.start_time.localeCompare(b.slot.start_time))[0]

  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          {patient ? `Good day, ${patient.first_name}.` : 'Welcome back.'}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Here's your appointment overview.</p>
      </motion.div>

      {error && <p className="text-sm text-error">{error}</p>}

      {needsRescheduling.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              {needsRescheduling.length} appointment{needsRescheduling.length > 1 ? 's' : ''} need{needsRescheduling.length === 1 ? 's' : ''} rescheduling
            </p>
            <p className="text-sm text-text-secondary">Your doctor marked this appointment as not completed. Pick a new slot to continue.</p>
          </div>
          <Link to="/patient/booked-appointments">
            <Button variant="secondary" size="sm">Review</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={CalendarCheck} label="Upcoming" value={appointments ? upcoming.length : null} />
        <SummaryCard icon={History} label="Completed" value={appointments ? completed.length : null} />
        <SummaryCard icon={Clock3} label="Needs rescheduling" value={appointments ? needsRescheduling.length : null} />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-text-primary">Next appointment</h2>
          <Link to="/patient/book">
            <Button size="sm">
              <CalendarPlus className="h-4 w-4" /> Book an appointment
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {!appointments ? (
            <SkeletonRows count={1} />
          ) : next ? (
            <AppointmentRow appointment={next} perspective="patient" />
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming appointments"
              description="Book your first appointment to get started."
              action={
                <Link to="/patient/book">
                  <Button size="sm">Book an appointment</Button>
                </Link>
              }
            />
          )}
        </div>
      </Card>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof CalendarCheck; label: string; value: number | null }) {
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
