import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Modal } from '@/components/Modal'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  error?: string | null
  disabled?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  loading,
  error,
  disabled,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} disabled={disabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-text-secondary">
        {description}
        {error && <ErrorBanner message={error} />}
      </div>
    </Modal>
  )
}
