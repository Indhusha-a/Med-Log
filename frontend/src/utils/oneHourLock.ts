import type { TimeSlot } from '@/types/api'

// Mirrors appointment_service._slot_datetime / _assert_outside_lock_window
// on the backend: slot date/time are naive local wall-clock values, so
// building a plain (timezone-less) JS Date from "YYYY-MM-DDTHH:MM:SS" and
// comparing to `new Date()` matches the backend's own comparison exactly,
// as long as the browser and the server agree on local time - true for
// this single-location deployment. Do NOT append a "Z" here; that would
// reintroduce the same UTC-vs-local bug the backend already hit once.
export function slotDateTime(slot: TimeSlot): Date {
  return new Date(`${slot.date}T${slot.start_time}`)
}

const LOCK_HOURS = 1 // matches backend CANCEL_LOCK_HOURS default

export function isInsideLockWindow(slot: TimeSlot, now: Date = new Date()): boolean {
  const lockDeadline = new Date(slotDateTime(slot).getTime() - LOCK_HOURS * 60 * 60 * 1000)
  return now >= lockDeadline
}

export function lockWindowMessage(): string {
  return `This appointment can no longer be changed - it's within ${LOCK_HOURS} hour of its scheduled time.`
}
