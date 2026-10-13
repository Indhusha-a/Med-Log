import type { UserRole } from '@/types/api'

// Single source of truth for where the JWT lives. The backend has no
// HttpOnly-cookie option as built, so this is plain localStorage - every
// request attaches it manually via the axios interceptors in services/.
const TOKEN_KEY = 'medlog.token'
const ROLE_KEY = 'medlog.role'
const USER_ID_KEY = 'medlog.userId'

export interface StoredSession {
  token: string
  role: UserRole
  userId: number
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(ROLE_KEY, session.role)
  localStorage.setItem(USER_ID_KEY, String(session.userId))
}

export function loadSession(): StoredSession | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = localStorage.getItem(ROLE_KEY) as UserRole | null
  const userId = localStorage.getItem(USER_ID_KEY)
  if (!token || !role || !userId) return null
  return { token, role, userId: Number(userId) }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_ID_KEY)
}
