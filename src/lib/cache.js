const STORAGE_KEY = 'hunt.desk.cache'
const TTL_MS = 2 * 60 * 1000

const memory = new Map()
let hydrated = false

function hydrate() {
  if (hydrated) return
  hydrated = true
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const stored = JSON.parse(raw)
    for (const [key, entry] of Object.entries(stored)) {
      if (entry && typeof entry.at === 'number' && entry.data !== undefined) memory.set(key, entry)
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(memory)))
  } catch {
    // The tab can keep the in-memory copy when storage is full.
  }
}

export function readCache(key) {
  hydrate()
  return memory.get(key) ?? null
}

export function freshCache(key) {
  const entry = readCache(key)
  return Boolean(entry && Date.now() - entry.at < TTL_MS)
}

export function writeCache(key, data) {
  hydrate()
  memory.set(key, { data, at: Date.now() })
  persist()
}

export function dropCache(prefix = '') {
  hydrate()
  for (const key of memory.keys()) {
    if (!prefix || key === prefix || key.startsWith(prefix)) memory.delete(key)
  }
  persist()
}

export function clearDeskCache() {
  memory.clear()
  hydrated = true
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore private-mode storage failures.
  }
}
