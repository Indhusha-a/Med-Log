import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/ToastProvider'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ErrorBanner } from '@/components/ErrorBanner'
import { Field } from '@/components/Field'
import { Input } from '@/components/Input'
import { getPatientMe, updatePatientMe } from '@/features/profile/api'
import type { Patient } from '@/types/api'
import { toApiError } from '@/utils/apiError'

const NAME_RE = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const PHONE_RE = /^07\d{8}$/

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
  last_name: z.string().min(1, 'Required').regex(NAME_RE, 'Letters and spaces only'),
  phone: z.string().regex(PHONE_RE, 'Must be exactly 10 digits and start with 07'),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Must include a digit').regex(/[^A-Za-z0-9]/, 'Must include a special character'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
type PasswordValues = z.infer<typeof passwordSchema>

export function PatientProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const { show } = useToast()

  useEffect(() => {
    getPatientMe().then(setPatient)
  }, [])

  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), values: patient ? { first_name: patient.first_name, last_name: patient.last_name, phone: patient.phone } : undefined })
  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  async function onSaveProfile(values: ProfileValues) {
    setProfileError(null)
    try {
      const updated = await updatePatientMe(values)
      setPatient(updated)
      show('success', 'Profile updated.')
    } catch (err) {
      setProfileError(toApiError(err).message)
    }
  }

  async function onSavePassword(values: PasswordValues) {
    setPasswordError(null)
    try {
      await updatePatientMe({ password: values.password })
      passwordForm.reset()
      show('success', 'Password changed.')
    } catch (err) {
      setPasswordError(toApiError(err).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-text-primary">Account settings</h1>

      <Card>
        <h2 className="font-display text-base font-semibold text-text-primary">Profile</h2>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="mt-4 flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" htmlFor="first_name" error={profileForm.formState.errors.first_name?.message}>
              <Input id="first_name" {...profileForm.register('first_name')} />
            </Field>
            <Field label="Last name" htmlFor="last_name" error={profileForm.formState.errors.last_name?.message}>
              <Input id="last_name" {...profileForm.register('last_name')} />
            </Field>
          </div>
          <Field label="Email" htmlFor="email">
            <Input id="email" value={patient?.email ?? ''} disabled />
          </Field>
          <Field label="Phone" htmlFor="phone" error={profileForm.formState.errors.phone?.message}>
            <Input id="phone" {...profileForm.register('phone')} />
          </Field>
          {profileError && <ErrorBanner message={profileError} />}
          <Button type="submit" loading={profileForm.formState.isSubmitting} className="self-start">
            Save profile
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-base font-semibold text-text-primary">Change password</h2>
        <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="mt-4 flex flex-col gap-4" noValidate>
          <Field label="New password" htmlFor="password" error={passwordForm.formState.errors.password?.message} hint="At least 8 characters, including a digit and a special character">
            <Input id="password" type="password" {...passwordForm.register('password')} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm_password" error={passwordForm.formState.errors.confirm_password?.message}>
            <Input id="confirm_password" type="password" {...passwordForm.register('confirm_password')} />
          </Field>
          {passwordError && <ErrorBanner message={passwordError} />}
          <Button type="submit" loading={passwordForm.formState.isSubmitting} className="self-start">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  )
}
