import { Route, Routes } from 'react-router-dom'
import { RequireRole } from '@/app/RequireRole'
import { AdminLayout } from '@/layouts/AdminLayout'
import { DoctorLayout } from '@/layouts/DoctorLayout'
import { PatientLayout } from '@/layouts/PatientLayout'
import { AdminCreateDoctorPage } from '@/pages/admin/AdminCreateDoctorPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { DoctorAppointmentsPage } from '@/pages/doctor/DoctorAppointmentsPage'
import { DoctorDashboard } from '@/pages/doctor/DoctorDashboard'
import { DoctorProfilePage } from '@/pages/doctor/DoctorProfilePage'
import { DoctorSlotsPage } from '@/pages/doctor/DoctorSlotsPage'
import { LandingPage } from '@/pages/landing/LandingPage'
import { NotFoundPage } from '@/pages/NotFound'
import { BookedAppointmentsPage } from '@/pages/patient/BookedAppointmentsPage'
import { BookingWizardPage } from '@/pages/patient/BookingWizardPage'
import { HistoryPage } from '@/pages/patient/HistoryPage'
import { PatientDashboard } from '@/pages/patient/PatientDashboard'
import { PatientProfilePage } from '@/pages/patient/PatientProfilePage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<RequireRole role="patient" />}>
        <Route element={<PatientLayout />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/book" element={<BookingWizardPage />} />
          <Route path="/patient/booked-appointments" element={<BookedAppointmentsPage />} />
          <Route path="/patient/history" element={<HistoryPage />} />
          <Route path="/patient/profile" element={<PatientProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="doctor" />}>
        <Route element={<DoctorLayout />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
          <Route path="/doctor/slots" element={<DoctorSlotsPage />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/doctors/new" element={<AdminCreateDoctorPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
