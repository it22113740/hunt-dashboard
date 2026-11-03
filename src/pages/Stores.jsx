import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { StoreTableSkeleton } from '../components/Skeleton'
import { StoreTable } from '../components/StoreTable'
import { listStores } from '../lib/api'
import { useQuery } from '../lib/query'

const LIMIT = 25

export function Stores() {
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const state = useQuery(`stores:newest:${q}:${offset}`, () =>
    listStores({ q, offset, limit: LIMIT, sort: 'newest' }),
  )
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onSearch(value) {
    setDraft(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setOffset(0)
      setQ(value.trim())
    }, 250)
  }

  function onPage(next) {
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
      {state.status === 'loading' ? <StoreTableSkeleton /> : null}
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
