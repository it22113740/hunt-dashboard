import { dropCache } from './cache'
import { clearSession, getToken } from './session'

const base = import.meta.env.VITE_API_URL ?? ''

let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function messageFrom(data) {
  const message = data?.message
  if (Array.isArray(message)) return message.join(' ')
  if (typeof message === 'string' && message.trim()) return message
  return 'Something went wrong. Try again.'
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the Hunt API. Check that the server is running.', 0)
  }

  const data = await response.json().catch(() => null)
  if (response.status === 401 && auth) {
    clearSession()
    dropCache()
    onUnauthorized()
  }
  if (!response.ok) throw new ApiError(messageFrom(data), response.status)
  return data
}

function query(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export function login(email, password) {
  return request('/admin/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export function me() {
  return request('/auth/me')
}

export function overview() {
  return request('/admin/overview')
}

export function listStores(params) {
  return request(`/admin/stores${query(params)}`)
}

function deskChanged() {
  dropCache('overview')
  dropCache('stores:')
  dropCache('users:')
  dropCache('owners')
}

export function onboardStore(body) {
  return request('/admin/stores', { method: 'POST', body }).then((data) => {
    deskChanged()
    return data
  })
}

export function listUsers(params) {
  return request(`/admin/users${query(params)}`)
}

export function banUser(id, reason) {
  return request(`/admin/users/${encodeURIComponent(id)}/ban`, {
    method: 'POST',
    body: { reason },
  }).then((data) => {
    deskChanged()
    return data
  })
}

export function unbanUser(id) {
  return request(`/admin/users/${encodeURIComponent(id)}/unban`, { method: 'POST' }).then((data) => {
    deskChanged()
    return data
  })
}
