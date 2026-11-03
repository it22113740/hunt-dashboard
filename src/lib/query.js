import { useEffect, useRef, useState } from 'react'
import { dropCache, freshCache, readCache, writeCache } from './cache'

export function useQuery(key, load) {
  const loadRef = useRef(load)
  const [revision, setRevision] = useState(0)
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    if (!key || freshCache(key)) return undefined
    let live = true
    loadRef.current().then(
      (data) => {
        writeCache(key, data)
        if (live) setFetched({ key, status: 'ready', data, error: null })
      },
      (error) => {
        if (!live) return
        const stale = readCache(key)
        if (stale) {
          setFetched({ key, status: 'ready', data: stale.data, error: null })
          return
        }
        setFetched((current) => {
          if (current?.key === key && current.data) return current
          return { key, status: 'error', data: null, error }
        })
      },
    )
    return () => {
      live = false
    }
  }, [key, revision])

  function refresh() {
    if (!key) return
    dropCache(key)
    setRevision((value) => value + 1)
  }

  if (!key) return { status: 'idle', data: null, error: null, refresh }

  if (fetched?.key === key && fetched.status === 'error') {
    const stale = readCache(key)
    if (!stale) return { status: 'error', data: null, error: fetched.error, refresh }
  }

  if (fetched?.key === key && fetched.status === 'ready') {
    return { status: 'ready', data: fetched.data, error: null, refresh }
  }

  const hit = readCache(key)
  if (hit) return { status: 'ready', data: hit.data, error: null, refresh }
  return { status: 'loading', data: null, error: null, refresh }
}
