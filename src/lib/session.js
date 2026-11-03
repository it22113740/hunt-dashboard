const KEY = 'hunt.superadmin.session'

export function readSession() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.accessToken || session.user?.role !== 'SUPERADMIN') return null
    return session
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}

export function getToken() {
  return readSession()?.accessToken ?? null
}
