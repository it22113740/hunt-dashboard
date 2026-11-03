import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Page } from '../components/Page'
import { FactsSkeleton, ScoreSkeleton, StoreTableSkeleton } from '../components/Skeleton'
import { ScoreSheet } from '../components/ScoreSheet'
import { StoreTable } from '../components/StoreTable'
import { overview } from '../lib/api'
import { formatCount } from '../lib/format'

export function Overview() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let live = true
    overview().then(
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
  }, [])

  return (
    <Page
      title="Overview"
      lede="Approved and rejected photos and videos, the stores on Hunt, and who is banned."
    >
      {state.status === 'loading' ? (
        <>
          <ScoreSkeleton compact />
          <FactsSkeleton />
          <div className="section-head">
            <h2>Latest stores</h2>
          </div>
          <StoreTableSkeleton caption="Loading the latest stores" />
        </>
      ) : null}
      {state.status === 'error' ? <Banner tone="error">{state.error.message}</Banner> : null}
      {state.status === 'ready' ? (
        <>
          <ScoreSheet media={state.data.media} compact />
          <ul className="facts">
            <li>
              <strong>{formatCount(state.data.stores)}</strong>
              stores
            </li>
            <li>
              <strong>{formatCount(state.data.people)}</strong>
              people
            </li>
            <li>
              <strong>{formatCount(state.data.banned)}</strong>
              banned
            </li>
          </ul>
          <div className="section-head">
            <h2>Latest stores</h2>
            <Link to="/stores">All stores</Link>
          </div>
          {state.data.recentStores.length ? (
            <StoreTable items={state.data.recentStores} caption="Latest onboarded stores" />
          ) : (
            <p className="empty">
              No stores onboarded yet. <Link to="/stores/new">Onboard a store</Link>
            </p>
          )}
        </>
      ) : null}
    </Page>
  )
}
