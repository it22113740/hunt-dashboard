import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { ScoreSkeleton, StoreTableSkeleton } from '../components/Skeleton'
import { ScoreSheet } from '../components/ScoreSheet'
import { StoreTable } from '../components/StoreTable'
import { listStores, overview } from '../lib/api'
import { useQuery } from '../lib/query'

const LIMIT = 25

export function Posts() {
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const desk = useQuery('overview', overview)
  const stores = useQuery(`stores:v3:rejected:${q}:${offset}`, () =>
    listStores({ q, offset, limit: LIMIT, sort: 'rejected' }),
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

  const items = stores.data?.items ?? []

  return (
    <Page title="Content" lede="Approved and rejected photos and videos across every store.">
      {desk.status === 'loading' ? <ScoreSkeleton /> : null}
      {desk.status === 'error' ? <Banner tone="error">{desk.error.message}</Banner> : null}
      {desk.status === 'ready' ? <ScoreSheet media={desk.data.media} /> : null}
      <div className="section-head">
        <h2>By store</h2>
      </div>
      <form className="toolbar" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search">
          <span>Search stores</span>
          <input
            className="control"
            value={draft}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Name, address, or owner email"
          />
        </label>
      </form>
      {stores.status === 'loading' ? <StoreTableSkeleton caption="Loading stores" /> : null}
      {stores.status === 'error' ? <Banner tone="error">{stores.error.message}</Banner> : null}
      {stores.status === 'ready' && items.length ? (
        <>
          <StoreTable items={items} caption="Approved and rejected content by store" />
          <Pager offset={stores.data.offset} limit={stores.data.limit} total={stores.data.total} onPage={onPage} />
        </>
      ) : null}
      {stores.status === 'ready' && !items.length ? (
        <p className="empty">
          {q ? (
            'No stores match that search.'
          ) : (
            <>
              No stores onboarded yet, so there is no content to count.{' '}
              <Link to="/stores/new">Onboard a store</Link>
            </>
          )}
        </p>
      ) : null}
    </Page>
  )
}
