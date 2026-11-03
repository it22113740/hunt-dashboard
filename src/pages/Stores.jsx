import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { StoreTable } from '../components/StoreTable'
import { listStores } from '../lib/api'

const LIMIT = 25

export function Stores() {
  const location = useLocation()
  const notice = location.state?.notice
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    let live = true
    listStores({ q, offset, limit: LIMIT, sort: 'newest' }).then(
      (data) => {
        if (live) setState({ status: 'ready', data, error: null })
      },
      (error) => {
        if (live) setState({ status: 'error', data: null, error })
      },
    )
    return () => {
      live = false
    }
  }, [q, offset])

  function onSearch(value) {
    setDraft(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setState({ status: 'loading', data: null, error: null })
      setOffset(0)
      setQ(value.trim())
    }, 250)
  }

  function onPage(next) {
    setState({ status: 'loading', data: null, error: null })
    setOffset(next)
  }

  const items = state.data?.items ?? []

  return (
    <Page
      title="Stores"
      lede="Places onboarded onto Hunt, and how their photos and videos were reviewed."
      action={
        <Link className="btn btn--primary" to="/stores/new">
          Onboard a store
        </Link>
      }
    >
      {notice ? <Banner tone="good">{notice}</Banner> : null}
      <form className="toolbar" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search">
          <span>Search</span>
          <input
            className="control"
            value={draft}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Name, address, or owner email"
          />
        </label>
      </form>
      {state.status === 'loading' ? <p className="status-line">Loading stores.</p> : null}
      {state.status === 'error' ? <Banner tone="error">{state.error.message}</Banner> : null}
      {state.status === 'ready' && items.length ? (
        <>
          <StoreTable items={items} />
          <Pager offset={state.data.offset} limit={state.data.limit} total={state.data.total} onPage={onPage} />
        </>
      ) : null}
      {state.status === 'ready' && !items.length ? (
        <p className="empty">
          {q ? 'No stores match that search.' : 'No stores onboarded yet.'}{' '}
          {!q ? <Link to="/stores/new">Onboard a store</Link> : null}
        </p>
      ) : null}
    </Page>
  )
}
