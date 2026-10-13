import { cn } from '@/utils/cn'

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const PALETTE = ['bg-blue-soft text-blue-primary', 'bg-success-bg text-success', 'bg-warning-bg text-warning']

export function Avatar({ firstName, lastName, size = 'md' }: { firstName: string; lastName: string; size?: 'sm' | 'md' | 'lg' }) {
  const paletteIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % PALETTE.length
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', PALETTE[paletteIndex], sizeClass)}
      aria-hidden="true"
    >
      {initials(firstName, lastName)}
    </div>
  )
}
