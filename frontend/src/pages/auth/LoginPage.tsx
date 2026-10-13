import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, Stethoscope, User, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/app/AuthProvider'
import { Button } from '@/components/Button'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Field } from '@/components/Field'
import { Input } from '@/components/Input'
import { toApiError } from '@/utils/apiError'
import { cn } from '@/utils/cn'
import type { UserRole } from '@/types/api'

const schema = z.object({
  identifier: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
})
type FormValues = z.infer<typeof schema>

const ROLE_CONFIG: Record<UserRole, { label: string; icon: typeof User; fieldLabel: string; placeholder: string; signupHint?: boolean }> = {
  patient: { label: 'Patient', icon: User, fieldLabel: 'Email address', placeholder: 'you@example.com', signupHint: true },
  doctor: { label: 'Doctor', icon: Stethoscope, fieldLabel: 'Doctor ID', placeholder: 'DOC001' },
  admin: { label: 'Admin', icon: ShieldCheck, fieldLabel: 'Administrator username', placeholder: 'admin' },
}

const HOME_BY_ROLE: Record<UserRole, string> = { patient: '/patient', doctor: '/doctor', admin: '/admin' }

export function LoginPage() {
  const [role, setRole] = useState<UserRole>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function selectRole(next: UserRole) {
    setRole(next)
    setApiError(null)
    reset()
  }

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      const loggedInRole = await login(role, values.identifier, values.password)
      navigate(HOME_BY_ROLE[loggedInRole], { replace: true })
    } catch (err) {
      setApiError(toApiError(err).message)
    }
  }

  const config = ROLE_CONFIG[role]

  return (
    <div className="flex min-h-screen bg-app-bg">
      <div className="relative hidden w-1/2 overflow-hidden bg-navy-deep lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(100,150,232,0.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(49,92,155,0.3),transparent_55%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-blue-accent" />
            <span className="font-display text-lg font-semibold">Med-Log</span>
          </Link>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="max-w-md font-display text-3xl font-semibold leading-tight text-white">
              Welcome back to a calmer way to manage appointments.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Your session is protected end-to-end with role-based access — patients, doctors, and admins each see
              only what's theirs.
            </p>
          </motion.div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Med-Log. Built for the AI Engineering assessment.</p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-navy-dark">
              <ShieldCheck className="h-5 w-5 text-blue-primary" />
              <span className="font-display text-lg font-semibold">Med-Log</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to continue to your workspace.</p>

          <div className="mt-6 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account type">
            {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => {
              const cfg = ROLE_CONFIG[r]
              const active = role === r
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => selectRole(r)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors',
                    active ? 'border-blue-primary bg-blue-soft text-blue-primary' : 'border-border bg-white text-text-secondary hover:border-blue-accent/40',
                  )}
                >
                  <cfg.icon className="h-4 w-4" />
                  {cfg.label}
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <Field label={config.fieldLabel} htmlFor="identifier" error={errors.identifier?.message}>
              <Input id="identifier" placeholder={config.placeholder} autoComplete="username" {...register('identifier')} />
            </Field>

            <Field label="Password" htmlFor="password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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

            {apiError && <ErrorBanner message={apiError} />}

            <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
              Sign in
            </Button>
          </form>

          {config.signupHint && (
            <p className="mt-6 text-center text-sm text-text-secondary">
              New patient?{' '}
              <Link to="/signup" className="font-medium text-blue-primary hover:underline">
                Create an account
              </Link>
            </p>
          )}

          <div className="mt-8 flex items-center gap-2 text-xs text-text-muted">
            <UserRound className="h-3.5 w-3.5" />
            Doctor and admin accounts are provisioned by an administrator — there is no self-signup for those roles.
          </div>
        </div>
      </div>
    </div>
  )
}
