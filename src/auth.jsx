import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { me, setUnauthorizedHandler } from './lib/api'
import { clearSession, readSession, saveSession } from './lib/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null))
  }, [])

  useEffect(() => {
    if (!session) return undefined
    let live = true
    me().then(
      (user) => {
        if (!live) return
        if (user.role !== 'SUPERADMIN') {
          clearSession()
          setSession(null)
        }
      },
      (error) => {
        if (!live) return
        if (error.status === 401 || error.status === 403) {
          clearSession()
          setSession(null)
        }
      },
    )
    return () => {
      live = false
    }
  }, [session])

  const value = useMemo(
    () => ({
      session,
      signIn(next) {
        const stored = { accessToken: next.accessToken, user: next.user }
        saveSession(stored)
        setSession(stored)
      },
      signOut() {
        clearSession()
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

export function RequireAuth() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
