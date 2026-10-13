import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { inputClasses } from '@/components/Field'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(inputClasses, className)} {...rest} />
})
