import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { Select } from '@/components/Select'
import { SkeletonRows } from '@/components/Skeleton'
import { listUsers } from '@/features/admin/api'
import type { AdminUserRow, UserRole } from '@/types/api'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'

const ROLE_BADGE: Record<UserRole, string> = {
  patient: 'bg-info-bg text-info',
  doctor: 'bg-success-bg text-success',
  admin: 'bg-warning-bg text-warning',
}

export function AdminUsersPage() {
  const [role, setRole] = useState<UserRole | ''>('')
  const [users, setUsers] = useState<AdminUserRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    listUsers(role || undefined)
      .then(setUsers)
      .catch((err) => setError(toApiError(err).message))
  }, [role])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Users</h1>
        <div className="w-44">
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole | '')} aria-label="Filter by role">
            <option value="">All roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Card className="overflow-hidden p-0">
        {users === null ? (
          <div className="p-5">
            <SkeletonRows />
          </div>
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Users} title="No users found" description="No users match this filter." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-app-bg-2 text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-divider last:border-0">
                  <td className="px-5 py-3 text-text-primary">{u.id}</td>
                  <td className="px-5 py-3">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', ROLE_BADGE[u.role])}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
