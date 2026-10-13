import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/Input'
import { getDoctorSlots, listDoctors } from '@/features/doctors/api'
import { rescheduleAppointment } from '@/features/appointments/api'
import type { Appointment, Doctor, TimeSlot } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'
import { todayIso } from '@/utils/dates'

interface RescheduleModalProps {
  appointment: Appointment | null
  onClose: () => void
  onSuccess: (updated: Appointment) => void
}

export function RescheduleModal({ appointment, onClose, onSuccess }: RescheduleModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [date, setDate] = useState(todayIso())
  const [slots, setSlots] = useState<TimeSlot[] | null>(null)
  const [slotId, setSlotId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appointment) return
    listDoctors().then(setDoctors).catch(() => undefined)
    setDoctorId(appointment.doctor.id)
    setDate(todayIso())
    setSlotId(null)
    setError(null)
  }, [appointment])

  useEffect(() => {
    if (!doctorId) return
    setSlots(null)
    setSlotId(null)
    getDoctorSlots(doctorId, date).then(setSlots).catch(() => setSlots([]))
  }, [doctorId, date])

  if (!appointment) return null
  const current = appointment

  async function handleSubmit() {
    if (!doctorId || !slotId) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await rescheduleAppointment(current.id, { doctor_id: doctorId, slot_id: slotId })
      onSuccess(updated)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      title="Reschedule appointment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={!slotId}>
            Confirm new time
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-text-primary">Doctor</p>
          <select
            value={doctorId ?? ''}
            onChange={(e) => setDoctorId(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.first_name} {d.last_name} — {d.speciality}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-text-primary">Date</p>
          <Input type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-text-primary">Available times</p>
          {slots === null && <p className="text-sm text-text-muted">Loading...</p>}
          {slots?.length === 0 && <p className="text-sm text-text-muted">No open slots on this date.</p>}
          {slots && slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlotId(s.id)}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-sm font-medium',
                    slotId === s.id ? 'border-blue-primary bg-blue-soft text-blue-primary' : 'border-border bg-white text-text-primary',
                  )}
                >
                  {s.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <ErrorBanner message={error} />}
      </div>
    </Modal>
  )
}
