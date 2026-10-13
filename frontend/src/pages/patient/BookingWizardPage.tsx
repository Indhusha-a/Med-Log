import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, CheckCircle2, ChevronLeft, Search, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Input } from '@/components/Input'
import { createAppointment } from '@/features/appointments/api'
import { getDoctorSlots, listDoctors } from '@/features/doctors/api'
import { getPatientMe } from '@/features/profile/api'
import { APPOINTMENT_TYPES } from '@/types/api'
import type { Appointment, AppointmentType, Doctor, Patient, TimeSlot } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'
import { todayIso } from '@/utils/dates'

const STEPS = ['Doctor', 'Date & time', 'Type', 'Review']

export function BookingWizardPage() {
  const [step, setStep] = useState(0)
  const [doctors, setDoctors] = useState<Doctor[] | null>(null)
  const [doctorQuery, setDoctorQuery] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const [date, setDate] = useState(todayIso())
  const [slots, setSlots] = useState<TimeSlot[] | null>(null)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Appointment | null>(null)

  useEffect(() => {
    listDoctors().then(setDoctors).catch(() => setDoctors([]))
    getPatientMe().then(setPatient).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!selectedDoctor) return
    setSelectedSlot(null)
    setSlots(null)
    setSlotsError(null)
    getDoctorSlots(selectedDoctor.id, date)
      .then(setSlots)
      .catch((err) => setSlotsError(toApiError(err).message))
  }, [selectedDoctor, date])

  const filteredDoctors = useMemo(() => {
    if (!doctors) return []
    const q = doctorQuery.trim().toLowerCase()
    if (!q) return doctors
    return doctors.filter(
      (d) => `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) || d.speciality.toLowerCase().includes(q),
    )
  }, [doctors, doctorQuery])

  async function handleConfirm() {
    if (!selectedDoctor || !selectedSlot || !appointmentType) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const appointment = await createAppointment({
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        appointment_type: appointmentType,
      })
      setConfirmed(appointment)
    } catch (err) {
      const { message } = toApiError(err)
      setSubmitError(message)
      // The slot may have just been taken by someone else - go back to
      // slot selection and refetch instead of leaving a stale list up.
      setStep(1)
      setSelectedSlot(null)
      if (selectedDoctor) {
        getDoctorSlots(selectedDoctor.id, date).then(setSlots).catch(() => undefined)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return <ConfirmationScreen appointment={confirmed} />
  }

  const canNext = [Boolean(selectedDoctor), Boolean(selectedSlot), Boolean(appointmentType), true][step]

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/patient" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold text-text-primary">Book an appointment</h1>

      <ol className="mt-6 flex items-center gap-2" aria-label="Booking progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                i < step ? 'bg-success text-white' : i === step ? 'bg-navy-dark text-white' : 'bg-app-bg-2 text-text-muted',
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn('hidden text-xs font-medium sm:block', i === step ? 'text-text-primary' : 'text-text-muted')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <Card className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
          >
            {step === 0 && (
              <StepDoctor
                doctors={filteredDoctors}
                loading={doctors === null}
                query={doctorQuery}
                onQueryChange={setDoctorQuery}
                selected={selectedDoctor}
                onSelect={setSelectedDoctor}
              />
            )}
            {step === 1 && selectedDoctor && (
              <StepSlot
                date={date}
                onDateChange={setDate}
                slots={slots}
                error={slotsError}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
              />
            )}
            {step === 2 && <StepType selected={appointmentType} onSelect={setAppointmentType} />}
            {step === 3 && selectedDoctor && selectedSlot && appointmentType && (
              <StepReview doctor={selectedDoctor} slot={selectedSlot} type={appointmentType} patient={patient} />
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mt-4">
            <ErrorBanner message={submitError} />
          </div>
        )}

        <div className="mt-6 flex justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleConfirm} loading={submitting}>
              Confirm appointment
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

function StepDoctor({
  doctors,
  loading,
  query,
  onQueryChange,
  selected,
  onSelect,
}: {
  doctors: Doctor[]
  loading: boolean
  query: string
  onQueryChange: (v: string) => void
  selected: Doctor | null
  onSelect: (d: Doctor) => void
}) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-text-primary">Choose a doctor</h2>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search by name or speciality" className="pl-9" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {loading && <p className="text-sm text-text-muted">Loading doctors...</p>}
        {!loading && doctors.length === 0 && <p className="text-sm text-text-muted">No doctors match your search.</p>}
        {doctors.map((d) => {
          const active = selected?.id === d.id
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                active ? 'border-blue-primary bg-blue-soft' : 'border-border bg-white hover:border-blue-accent/40',
              )}
            >
              <Avatar firstName={d.first_name} lastName={d.last_name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">Dr. {d.first_name} {d.last_name}</p>
                <p className="truncate text-xs text-text-muted">
                  {d.speciality} · ${d.consultation_rate.toFixed(2)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepSlot({
  date,
  onDateChange,
  slots,
  error,
  selected,
  onSelect,
}: {
  date: string
  onDateChange: (v: string) => void
  slots: TimeSlot[] | null
  error: string | null
  selected: TimeSlot | null
  onSelect: (s: TimeSlot) => void
}) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-text-primary">Pick a date and time</h2>
      <div className="mt-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-text-muted" />
        <Input type="date" min={todayIso()} value={date} onChange={(e) => onDateChange(e.target.value)} className="w-44" />
      </div>
      <div className="mt-4">
        {error && <ErrorBanner message={error} />}
        {!error && slots === null && <p className="text-sm text-text-muted">Loading available slots...</p>}
        {!error && slots?.length === 0 && (
          <p className="text-sm text-text-muted">No open slots for this doctor on this date. Try another date.</p>
        )}
        {!error && slots && slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  selected?.id === s.id ? 'border-blue-primary bg-blue-soft text-blue-primary' : 'border-border bg-white text-text-primary hover:border-blue-accent/40',
                )}
              >
                {s.start_time.slice(0, 5)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StepType({ selected, onSelect }: { selected: AppointmentType | null; onSelect: (t: AppointmentType) => void }) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-text-primary">What's this appointment for?</h2>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {APPOINTMENT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onSelect(t.value)}
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              selected === t.value ? 'border-blue-primary bg-blue-soft text-blue-primary' : 'border-border bg-white text-text-primary hover:border-blue-accent/40',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StepReview({ doctor, slot, type, patient }: { doctor: Doctor; slot: TimeSlot; type: AppointmentType; patient: Patient | null }) {
  const typeLabel = APPOINTMENT_TYPES.find((t) => t.value === type)?.label ?? type
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-text-primary">Review and confirm</h2>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border p-4">
        <Row label="Doctor" value={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
        <Row label="Speciality" value={doctor.speciality} />
        <Row label="Consultation rate" value={`$${doctor.consultation_rate.toFixed(2)}`} />
        <Row label="Date" value={slot.date} />
        <Row label="Time" value={`${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`} />
        <Row label="Appointment type" value={typeLabel} />
        <div className="mt-1 border-t border-border pt-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Booking as</p>
          <p className="mt-1 text-sm font-medium text-text-primary">
            {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
          </p>
          <p className="text-xs text-text-muted">{patient?.phone}</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  )
}

function ConfirmationScreen({ appointment }: { appointment: Appointment }) {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <CheckCircle2 className="h-14 w-14 text-success" />
      <h1 className="font-display text-2xl font-semibold text-text-primary">Appointment confirmed</h1>
      <p className="text-sm text-text-secondary">
        With Dr. {appointment.doctor.first_name} {appointment.doctor.last_name} on {appointment.slot.date} at{' '}
        {appointment.slot.start_time.slice(0, 5)}.
      </p>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          Dashboard
        </Button>
        <Button onClick={() => navigate('/patient/booked-appointments')}>View booked appointments</Button>
      </div>
      <Stethoscope className="mt-6 h-5 w-5 text-text-muted" />
    </div>
  )
}
