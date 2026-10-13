import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import type { UserRole } from '@/types/api'

const HOME_BY_ROLE: Record<UserRole, string> = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
}

// Wraps a route tree and enforces: must be logged in, and must be the
// right role. This is a UX guard only - every request still goes
// through the backend's own JWT/role check, which is the real boundary.
export function RequireRole({ role }: { role: UserRole }) {
  const { isAuthenticated, role: currentRole, initializing } = useAuth()

  if (initializing) {
    return null // avoid flashing protected content while session restores
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (currentRole !== role) {
    return <Navigate to={HOME_BY_ROLE[currentRole as UserRole]} replace />
  }
  return <Outlet />
}
