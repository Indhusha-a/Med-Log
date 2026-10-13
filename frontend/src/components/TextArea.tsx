import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { inputClasses } from '@/components/Field'

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(inputClasses, 'h-auto min-h-24 py-2', className)} {...rest} />
  },
)
