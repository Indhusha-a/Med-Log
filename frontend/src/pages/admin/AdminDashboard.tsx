import { Activity, CircleAlert, Database, UserPlus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { getHealth } from '@/features/admin/api'
import type { HealthResponse } from '@/types/api'
import { toApiError } from '@/utils/apiError'

type HealthState = { kind: 'loading' } | { kind: 'ok'; data: HealthResponse } | { kind: 'error'; message: string }

export function AdminDashboard() {
  const [health, setHealth] = useState<HealthState>({ kind: 'loading' })

  function checkHealth() {
    setHealth({ kind: 'loading' })
    getHealth()
      .then((data) => setHealth({ kind: 'ok', data }))
      .catch((err) => setHealth({ kind: 'error', message: toApiError(err).message }))
  }

  useEffect(checkHealth, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Administration</h1>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
            <Activity className="h-4 w-4 text-blue-primary" /> System health
          </h2>
          <Button variant="ghost" size="sm" onClick={checkHealth}>
            Refresh
          </Button>
        </div>

        <div className="mt-4">
          {health.kind === 'loading' && <p className="text-sm text-text-muted">Checking...</p>}
          {health.kind === 'error' && (
            <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
              <CircleAlert className="h-4 w-4" /> Unreachable — {health.message}
            </div>
          )}
          {health.kind === 'ok' && (
            <div className="flex items-center gap-6">
              <StatusPill label="API" ok={health.data.status === 'ok'} />
              <StatusPill label="Database" ok={health.data.database === 'ok'} icon={Database} />
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Manage users</p>
              <p className="text-xs text-text-muted">View and filter by role</p>
            </div>
          </div>
          <Link to="/admin/users">
            <Button variant="secondary" size="sm">Open</Button>
          </Link>
        </Card>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Create doctor</p>
              <p className="text-xs text-text-muted">Seed a new doctor account</p>
            </div>
          </div>
          <Link to="/admin/doctors/new">
            <Button variant="secondary" size="sm">Open</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}

function StatusPill({ label, ok, icon: Icon }: { label: string; ok: boolean; icon?: typeof Database }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-text-muted" />}
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={ok ? 'inline-flex h-2 w-2 rounded-full bg-success' : 'inline-flex h-2 w-2 rounded-full bg-error'} />
      <span className={ok ? 'text-sm font-medium text-success' : 'text-sm font-medium text-error'}>{ok ? 'Healthy' : 'Degraded'}</span>
    </div>
  )
}
