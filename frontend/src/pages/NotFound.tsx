import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-bg px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-soft text-blue-primary">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        The page you're looking for doesn't exist, or you don't have access to it.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
