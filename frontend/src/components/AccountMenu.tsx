import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/AuthProvider'
import { cn } from '@/utils/cn'

interface AccountMenuProps {
  name: string
  subtitle: string
  profileHref: string
}

export function AccountMenu({ name, subtitle, profileHref }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-app-bg-2"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-dark text-white">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium leading-tight text-text-primary">{name}</p>
          <p className="text-xs leading-tight text-text-muted">{subtitle}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lifted"
        >
          <Link
            to={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-app-bg-2"
          >
            <UserRound className="h-4 w-4" /> Account settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error-bg"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}
