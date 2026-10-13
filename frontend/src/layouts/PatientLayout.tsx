import { Calendar, History, LayoutDashboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AccountMenu } from '@/components/AccountMenu'
import { ChatWidget } from '@/features/chatbot/ChatWidget'
import { getPatientMe } from '@/features/profile/api'
import { AppShell, type NavItem } from '@/layouts/AppShell'
import type { Patient } from '@/types/api'

const NAV_ITEMS: NavItem[] = [
  { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/booked-appointments', label: 'Booked Appointments', icon: Calendar },
  { to: '/patient/history', label: 'History', icon: History },
]

export function PatientLayout() {
  const [patient, setPatient] = useState<Patient | null>(null)

  useEffect(() => {
    getPatientMe().then(setPatient).catch(() => undefined)
  }, [])

  return (
    <>
      <AppShell
        navItems={NAV_ITEMS}
        brandLabel="Patient workspace"
        topRight={
          <AccountMenu
            name={patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
            subtitle="Patient"
            profileHref="/patient/profile"
          />
        }
      />
      <ChatWidget />
    </>
  )
}
