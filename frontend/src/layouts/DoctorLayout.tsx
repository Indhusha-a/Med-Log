import { CalendarClock, LayoutDashboard, ListChecks } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AccountMenu } from '@/components/AccountMenu'
import { ChatWidget } from '@/features/chatbot/ChatWidget'
import { getDoctorMe } from '@/features/doctors/api'
import { AppShell, type NavItem } from '@/layouts/AppShell'
import type { Doctor } from '@/types/api'

const NAV_ITEMS: NavItem[] = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/doctor/appointments', label: 'All Appointments', icon: ListChecks },
  { to: '/doctor/slots', label: 'Availability', icon: CalendarClock },
]

export function DoctorLayout() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)

  useEffect(() => {
    getDoctorMe().then(setDoctor).catch(() => undefined)
  }, [])

  return (
    <>
      <AppShell
        navItems={NAV_ITEMS}
        brandLabel="Doctor workspace"
        topRight={
          <AccountMenu
            name={doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Loading...'}
            subtitle={doctor?.doctor_id ?? 'Doctor'}
            profileHref="/doctor/profile"
          />
        }
      />
      <ChatWidget />
    </>
  )
}
