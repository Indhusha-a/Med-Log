import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/ToastProvider'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Field } from '@/components/Field'
import { Input } from '@/components/Input'
import { listDoctorAppointments } from '@/features/appointments/api'
import { createSlot, getDoctorMe, getDoctorSlots } from '@/features/doctors/api'
import type { Doctor, TimeSlot } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { todayIso } from '@/utils/dates'

const schema = z
  .object({ start_time: z.string().min(1, 'Required'), end_time: z.string().min(1, 'Required') })
  .refine((d) => d.end_time > d.start_time, { message: 'End time must be after start time', path: ['end_time'] })
type FormValues = z.infer<typeof schema>

export function DoctorSlotsPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [date, setDate] = useState(todayIso())
  const [slots, setSlots] = useState<TimeSlot[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const { show } = useToast()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    getDoctorMe().then(setDoctor).catch(() => undefined)
  }, [])

  function refresh() {
    setError(null)
    // GET /doctors/{id}/slots only returns OPEN slots (is_booked=false) -
    // to show the full day including booked ones, merge in that day's
    // appointments too, each of which already carries its booked slot.
    if (!doctor) return
    Promise.all([getDoctorSlots(doctor.id, date), listDoctorAppointments({ date_from: date, date_to: date })])
      .then(([open, appts]) => {
        const booked = appts.map((a) => a.slot)
        const merged = [...open, ...booked].sort((a, b) => a.start_time.localeCompare(b.start_time))
        setSlots(merged)
      })
      .catch((err) => setError(toApiError(err).message))
  }

  useEffect(refresh, [doctor, date])

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await createSlot({ date, start_time: `${values.start_time}:00`, end_time: `${values.end_time}:00` })
      reset()
      show('success', 'Slot added.')
      refresh()
    } catch (err) {
      setFormError(toApiError(err).message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Availability</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
        <Card>
          <h2 className="font-display text-base font-semibold text-text-primary">Add a time slot</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4" noValidate>
            <Field label="Date" htmlFor="slot-date">
              <Input id="slot-date" type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Start time" htmlFor="start_time" error={errors.start_time?.message}>
              <Input id="start_time" type="time" {...register('start_time')} />
            </Field>
            <Field label="End time" htmlFor="end_time" error={errors.end_time?.message}>
              <Input id="end_time" type="time" {...register('end_time')} />
            </Field>
            {formError && <ErrorBanner message={formError} />}
            <Button type="submit" loading={isSubmitting}>
              Add slot
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-text-primary">Slots on {date}</h2>
          <div className="mt-4">
            {error && <ErrorBanner message={error} />}
            {!error && slots === null && <p className="text-sm text-text-muted">Loading...</p>}
            {!error && slots?.length === 0 && (
              <EmptyState icon={CalendarClock} title="No slots yet" description="Add your first slot for this date on the left." />
            )}
            {!error && slots && slots.length > 0 && (
              <div className="flex flex-col gap-2">
                {slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                    <span className="text-sm font-medium text-text-primary">
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                    </span>
                    <span className={s.is_booked ? 'text-xs font-medium text-warning' : 'text-xs font-medium text-success'}>
                      {s.is_booked ? 'Booked' : 'Open'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
