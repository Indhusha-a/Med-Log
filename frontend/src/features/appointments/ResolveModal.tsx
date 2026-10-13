import { CheckCircle2, Clock3, UserX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Modal } from '@/components/Modal'
import { resolveAppointment } from '@/features/appointments/api'
import type { Appointment, AppointmentResolveRequest } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'

interface ResolveModalProps {
  appointment: Appointment | null
  onClose: () => void
  onSuccess: (updated: Appointment) => void
}

const OPTIONS: { value: AppointmentResolveRequest['status']; label: string; description: string; icon: typeof CheckCircle2 }[] = [
  { value: 'completed', label: 'Completed', description: 'The appointment happened as planned.', icon: CheckCircle2 },
  { value: 'no_show', label: 'No-show', description: "The patient didn't show up.", icon: UserX },
  { value: 'needs_rescheduling', label: 'Needs rescheduling', description: "Didn't happen, but should be rebooked. Frees the slot.", icon: Clock3 },
]

export function ResolveModal({ appointment, onClose, onSuccess }: ResolveModalProps) {
  const [choice, setChoice] = useState<AppointmentResolveRequest['status'] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!appointment) return null
  const current = appointment

  async function handleSubmit() {
    if (!choice) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await resolveAppointment(current.id, { status: choice })
      onSuccess(updated)
      setChoice(null)
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
      title="Resolve appointment"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={!choice}>
            Save
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-secondary">
        {appointment.patient.first_name} {appointment.patient.last_name} - {appointment.slot.date} at {appointment.slot.start_time.slice(0, 5)}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setChoice(opt.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
              choice === opt.value ? 'border-blue-primary bg-blue-soft' : 'border-border bg-white hover:border-blue-accent/40',
            )}
          >
            <opt.icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">{opt.label}</p>
              <p className="text-xs text-text-secondary">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}
    </Modal>
  )
}
