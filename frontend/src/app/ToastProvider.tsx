import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  show: (kind: ToastKind, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
}

const COLORS: Record<ToastKind, string> = {
  success: 'border-success/20 text-success',
  error: 'border-error/20 text-error',
  info: 'border-info/20 text-info',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, kind, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 sm:bottom-6 sm:right-6" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.kind]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lifted',
                  COLORS[toast.kind],
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
