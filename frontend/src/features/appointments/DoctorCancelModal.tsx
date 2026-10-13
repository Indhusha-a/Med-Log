import { useState } from 'react'
import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Modal } from '@/components/Modal'
import { TextArea } from '@/components/TextArea'
import { doctorCancelAppointment } from '@/features/appointments/api'
import type { Appointment } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'

const MIN_LENGTH = 10

interface DoctorCancelModalProps {
  appointment: Appointment | null
  onClose: () => void
  onSuccess: (updated: Appointment) => void
}

export function DoctorCancelModal({ appointment, onClose, onSuccess }: DoctorCancelModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!appointment) return null
  const current = appointment

  const trimmedLength = reason.trim().length
  const valid = trimmedLength >= MIN_LENGTH

  async function handleSubmit() {
    if (!valid) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await doctorCancelAppointment(current.id, { reason })
      onSuccess(updated)
      setReason('')
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
      title="Cancel appointment"
      maxWidthClass="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Close
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={submitting} disabled={!valid}>
            Cancel appointment
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        With {appointment.patient.first_name} {appointment.patient.last_name} on {appointment.slot.date} at{' '}
        {appointment.slot.start_time.slice(0, 5)}. Cancelling requires an explanation of at least {MIN_LENGTH} characters, and isn't
        allowed within one hour of the appointment.
      </p>

      <div className="mt-4">
        <TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this appointment is being cancelled..."
          rows={5}
        />
        <p className={cn('mt-1 text-right text-xs', valid ? 'text-success' : 'text-text-muted')}>
          {trimmedLength} / {MIN_LENGTH} characters
        </p>
      </div>

      {error && (
        <div className="mt-2">
          <ErrorBanner message={error} />
        </div>
      )}
    </Modal>
  )
}
