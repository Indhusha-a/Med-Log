import { CircleAlert } from 'lucide-react'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-sm text-error" role="alert">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
