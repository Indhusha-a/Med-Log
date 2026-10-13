// A tiny decoupling point: the axios clients in services/ run outside
// React and can't call useNavigate() directly. AuthProvider registers a
// handler here once at startup; either api client calls it on a 401 so
// there's exactly one place that reacts to "the session is no longer
// valid" instead of each client redirecting independently.
let handler: (() => void) | null = null

export function onUnauthorized(fn: () => void): void {
  handler = fn
}

export function notifyUnauthorized(): void {
  handler?.()
}
