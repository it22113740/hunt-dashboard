import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { ScoreSheet } from '../components/ScoreSheet'
import { StoreTable } from '../components/StoreTable'
import { listStores, overview } from '../lib/api'

const LIMIT = 25

export function Posts() {
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const [desk, setDesk] = useState({ status: 'loading', data: null, error: null })
  const [stores, setStores] = useState({ status: 'loading', data: null, error: null })
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    let live = true
    overview().then(
      (data) => {
        if (live) setDesk({ status: 'ready', data, error: null })
      },
      (error) => {
        if (live) setDesk({ status: 'error', data: null, error })
      },
    )
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    let live = true
    listStores({ q, offset, limit: LIMIT, sort: 'rejected' }).then(
      (data) => {
        if (live) setStores({ status: 'ready', data, error: null })
      },
      (error) => {
        if (live) setStores({ status: 'error', data: null, error })
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
      setStores({ status: 'loading', data: null, error: null })
      setOffset(0)
      setQ(value.trim())
    }, 250)
  }

  function onPage(next) {
    setStores({ status: 'loading', data: null, error: null })
    setOffset(next)
  }

  const items = stores.data?.items ?? []

  return (
    <Page title="Posts" lede="Approved and rejected photos and videos across every store.">
      {desk.status === 'loading' ? <p className="status-line">Loading post counts.</p> : null}
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
      {stores.status === 'loading' ? <p className="status-line">Loading stores.</p> : null}
      {stores.status === 'error' ? <Banner tone="error">{stores.error.message}</Banner> : null}
      {stores.status === 'ready' && items.length ? (
        <>
          <StoreTable items={items} caption="Approved and rejected posts by store" />
          <Pager offset={stores.data.offset} limit={stores.data.limit} total={stores.data.total} onPage={onPage} />
        </>
      ) : null}
      {stores.status === 'ready' && !items.length ? (
        <p className="empty">
          {q ? (
            'No stores match that search.'
          ) : (
            <>
              No stores onboarded yet, so there are no posts to count.{' '}
              <Link to="/stores/new">Onboard a store</Link>
            </>
          )}
        </p>
      ) : null}
    </Page>
  )
}
