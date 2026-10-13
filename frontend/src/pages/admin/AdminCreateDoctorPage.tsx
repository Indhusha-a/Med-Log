import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Field } from '@/components/Field'
import { Input } from '@/components/Input'
import { seedDoctor } from '@/features/admin/api'
import { toApiError } from '@/utils/apiError'

const NAME_RE = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const PHONE_RE = /^07\d{8}$/

// Mirrors backend/app/schemas/doctor.py's DoctorCreateRequest exactly.
const schema = z.object({
  doctor_id: z.string().min(1, 'Required'),
  first_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
  last_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
  email: z.string().min(1, 'Required').email('Enter a valid email address'),
  phone: z.string().regex(PHONE_RE, 'Must be exactly 10 digits and start with 07'),
  speciality: z.string().min(1, 'Required'),
  consultation_rate: z
    .string()
    .min(1, 'Required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Must include a digit').regex(/[^A-Za-z0-9]/, 'Must include a special character'),
})
type FormValues = z.infer<typeof schema>

export function AdminCreateDoctorPage() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setApiError(null)
    try {
      await seedDoctor({ ...values, consultation_rate: Number(values.consultation_rate) })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setApiError(toApiError(err).message)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Create doctor account</h1>
      <p className="mt-1 text-sm text-text-secondary">Doctors don't self-register — this is the only way a doctor account is created.</p>

      <Card className="mt-6">
        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-success/20 bg-success-bg px-3 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Doctor account created.
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Doctor ID" htmlFor="doctor_id" error={errors.doctor_id?.message} hint="Login identifier, e.g. DOC003">
              <Input id="doctor_id" {...register('doctor_id')} />
            </Field>
            <Field label="Speciality" htmlFor="speciality" error={errors.speciality?.message}>
              <Input id="speciality" {...register('speciality')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" htmlFor="first_name" error={errors.first_name?.message}>
              <Input id="first_name" {...register('first_name')} />
            </Field>
            <Field label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
              <Input id="last_name" {...register('last_name')} />
            </Field>
          </div>
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" {...register('email')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" htmlFor="phone" error={errors.phone?.message} hint="10 digits, starting with 07">
              <Input id="phone" {...register('phone')} />
            </Field>
            <Field label="Consultation rate" htmlFor="consultation_rate" error={errors.consultation_rate?.message}>
              <Input id="consultation_rate" type="number" step="0.01" min="0" {...register('consultation_rate')} />
            </Field>
          </div>
          <Field label="Temporary password" htmlFor="password" error={errors.password?.message} hint="At least 8 characters, including a digit and a special character">
            <Input id="password" type="password" {...register('password')} />
          </Field>

          {apiError && <ErrorBanner message={apiError} />}

          <Button type="submit" loading={isSubmitting} className="self-start">
            Create doctor
          </Button>
        </form>
      </Card>
    </div>
  )
}
