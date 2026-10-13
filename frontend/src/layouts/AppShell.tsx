import type { LucideIcon } from 'lucide-react'
import { LogOut, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { cn } from '@/utils/cn'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

interface AppShellProps {
  navItems: NavItem[]
  topRight: ReactNode
  brandLabel: string
}

export function AppShell({ navItems, topRight, brandLabel }: AppShellProps) {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-app-bg">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-navy-dark px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-accent/20 text-blue-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Med-Log</p>
            <p className="text-[11px] text-white/50">{brandLabel}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Deliberately separate from the nav list above, per the design
            spec: logout should never be just another item someone could
            click by accident while navigating. */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-error/20 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <MobileNav navItems={navItems} brandLabel={brandLabel} />
          <div />
          {topRight}
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MobileNav({ navItems, brandLabel }: { navItems: NavItem[]; brandLabel: string }) {
  const { logout } = useAuth()
  return (
    <details className="relative lg:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-text-primary hover:bg-app-bg-2">
        <ShieldCheck className="h-4 w-4 text-blue-primary" /> Med-Log
      </summary>
      <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-lifted">
        <p className="px-2 pb-1 text-[11px] uppercase tracking-wide text-text-muted">{brandLabel}</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-2 py-2 text-sm',
                isActive ? 'bg-blue-soft text-blue-primary' : 'text-text-primary hover:bg-app-bg-2',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border px-2 py-2 pt-2.5 text-left text-sm text-error hover:bg-error-bg"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </details>
  )
}
