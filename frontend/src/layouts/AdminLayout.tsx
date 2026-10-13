import { LayoutDashboard, UserPlus, Users } from 'lucide-react'
import { AccountMenu } from '@/components/AccountMenu'
import { AppShell, type NavItem } from '@/layouts/AppShell'

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/doctors/new', label: 'Create Doctor', icon: UserPlus },
]

export function AdminLayout() {
  return (
    <AppShell
      navItems={NAV_ITEMS}
      brandLabel="Administration"
      topRight={<AccountMenu name="Administrator" subtitle="Admin" profileHref="/admin" />}
    />
  )
}
