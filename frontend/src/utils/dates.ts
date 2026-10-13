// `new Date().toISOString()` converts to UTC first - on a UTC+5:30
// machine, anything after 6:30pm local time rolls over to "tomorrow" in
// UTC, so slicing it for "today's date" silently shows the wrong day for
// part of the day. This is the same class of bug the backend hit once
// (see appointment_service._slot_datetime's comment) - fixed here the
// same way: build the date string from local Y/M/D parts, never through
// a UTC conversion.
export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
