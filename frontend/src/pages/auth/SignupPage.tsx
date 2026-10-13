import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { signup } from '@/features/auth/api'
import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Field } from '@/components/Field'
import { Input } from '@/components/Input'
import { toApiError } from '@/utils/apiError'

// Mirrors backend/app/schemas/auth.py's PatientSignupRequest validators exactly.
const NAME_RE = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const PHONE_RE = /^07\d{8}$/

const schema = z
  .object({
    first_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
    last_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
    email: z.string().min(1, 'Required').email('Enter a valid email address'),
    phone: z.string().regex(PHONE_RE, 'Must be exactly 10 digits and start with 07'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/\d/, 'Must include a digit')
      .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirm_password: z.string().min(1, 'Required'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      await signup(values)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 1400)
    } catch (err) {
      setApiError(toApiError(err).message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-soft">
        <Link to="/" className="flex items-center gap-2 text-navy-dark">
          <ShieldCheck className="h-5 w-5 text-blue-primary" />
          <span className="font-display text-lg font-semibold">Med-Log</span>
        </Link>

        <h1 className="mt-6 font-display text-2xl font-semibold text-text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-text-secondary">Patient registration — book your first appointment in minutes.</p>

        {success ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="font-medium text-text-primary">Account created</p>
            <p className="text-sm text-text-secondary">Taking you to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" htmlFor="first_name" error={errors.first_name?.message} required>
                <Input id="first_name" autoComplete="given-name" {...register('first_name')} />
              </Field>
              <Field label="Last name" htmlFor="last_name" error={errors.last_name?.message} required>
                <Input id="last_name" autoComplete="family-name" {...register('last_name')} />
              </Field>
            </div>

            <Field label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
            </Field>

            <Field
              label="Phone number"
              htmlFor="phone"
              error={errors.phone?.message}
              hint="10 digits, starting with 07"
              required
            >
              <Input id="phone" type="tel" inputMode="numeric" placeholder="07XXXXXXXX" {...register('phone')} />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
              hint="At least 8 characters, including a digit and a special character"
              required
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm password" htmlFor="confirm_password" error={errors.confirm_password?.message} required>
              <Input id="confirm_password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...register('confirm_password')} />
            </Field>

            {apiError && <ErrorBanner message={apiError} />}

            <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
              Create account
            </Button>
          </form>
        )}

        {!success && (
          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
