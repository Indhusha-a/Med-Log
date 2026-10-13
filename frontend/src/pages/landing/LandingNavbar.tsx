import { Menu, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#ai-assistant', label: 'AI Assistant' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled ? 'border-b border-white/10 bg-navy-deep/80 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-white">
          <ShieldCheck className="h-5 w-5 text-blue-accent" />
          <span className="font-display text-lg font-semibold">Med-Log</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-navy-deep transition-colors hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-navy-deep px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="py-1 text-sm text-white/80">
                {link.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)} className="py-1 text-sm text-white/80">
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-navy-deep"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
