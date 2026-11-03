const count = new Intl.NumberFormat('en-IN')
const day = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatCount(value) {
  return count.format(value ?? 0)
}

export function formatDate(value) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return day.format(parsed)
}

export function roleLabel(role) {
  if (role === 'OWNER') return 'Store owner'
  if (role === 'USER') return 'Guest'
  return role
}

export function temporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}
