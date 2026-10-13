import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-soft text-blue-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-semibold text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action}
    </div>
  )
}
