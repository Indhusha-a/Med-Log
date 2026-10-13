import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '@/features/auth/api'
import type { UserRole } from '@/types/api'
import { clearSession, loadSession, saveSession } from '@/utils/authStorage'
import { onUnauthorized } from '@/utils/authEvents'

interface AuthContextValue {
  isAuthenticated: boolean
  role: UserRole | null
  userId: number | null
  initializing: boolean
  login: (role: UserRole, identifier: string, password: string) => Promise<UserRole>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const session = loadSession()
    if (session) {
      setRole(session.role)
      setUserId(session.userId)
    }
    setInitializing(false)
  }, [])

  useEffect(() => {
    onUnauthorized(() => {
      clearSession()
      setRole(null)
      setUserId(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: role !== null,
      role,
      userId,
      initializing,
      login: async (loginRole, identifier, password) => {
        const res = await loginApi({ role: loginRole, identifier, password })
        saveSession({ token: res.access_token, role: res.role, userId: res.user_id })
        setRole(res.role)
        setUserId(res.user_id)
        return res.role
      },
      logout: () => {
        clearSession()
        setRole(null)
        setUserId(null)
        navigate('/', { replace: true })
      },
    }),
    [role, userId, initializing],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
