import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banner } from '../components/Banner'
import { Dialog } from '../components/Dialog'
import { Field } from '../components/Field'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { StoreTableSkeleton } from '../components/Skeleton'
import { StoreTable } from '../components/StoreTable'
import { describedBy } from '../lib/form'
import { banStore, listStores, unbanStore } from '../lib/api'
import { useQuery } from '../lib/query'
import { useToast } from '../toast'

const LIMIT = 25

export function Stores() {
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [offset, setOffset] = useState(0)
  const state = useQuery(`stores:v4:newest:${q}:${offset}`, () =>
    listStores({ q, offset, limit: LIMIT, sort: 'newest' }),
  )
  const [pending, setPending] = useState(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
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

  function closeDialog() {
    if (busy) return
    setPending(null)
    setReason('')
    setReasonError('')
    setActionError('')
  }

  async function onConfirm() {
    if (!pending) return
    setActionError('')
    if (pending.action === 'ban' && reason.trim().length < 3) {
      setReasonError('Give a reason of at least 3 characters.')
      return
    }
    setBusy(true)
    try {
      if (pending.action === 'ban') {
        await banStore(pending.store.id, reason.trim())
        toast(`Banned ${pending.store.name}`)
      } else {
        await unbanStore(pending.store.id)
        toast(`Restored ${pending.store.name}`)
      }
      setPending(null)
      setReason('')
      setReasonError('')
      state.refresh()
    } catch (error) {
      setActionError(error.message || 'That change did not save.')
    } finally {
      setBusy(false)
    }
  }

  const items = state.data?.items ?? []
  const banning = pending?.action === 'ban'

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
      {state.status === 'loading' ? <StoreTableSkeleton actions promotions /> : null}
      {state.status === 'error' ? <Banner tone="error">{state.error.message}</Banner> : null}
      {state.status === 'ready' && items.length ? (
        <>
          <StoreTable
            promotions
            items={items}
            onBan={(store) => {
              setReason('')
              setReasonError('')
              setActionError('')
              setPending({ action: 'ban', store })
            }}
            onUnban={(store) => {
              setActionError('')
              setPending({ action: 'unban', store })
            }}
          />
          <Pager offset={state.data.offset} limit={state.data.limit} total={state.data.total} onPage={onPage} />
        </>
      ) : null}
      {state.status === 'ready' && !items.length ? (
        <p className="empty">
          {q ? 'No stores match that search.' : 'No stores onboarded yet.'}{' '}
          {!q ? <Link to="/stores/new">Onboard a store</Link> : null}
        </p>
      ) : null}

      <Dialog open={Boolean(pending)} title={banning ? 'Ban this store' : 'Restore this store'} onClose={closeDialog}>
        {pending ? (
          <>
            <p className="dialog__who">{pending.store.name}</p>
            {banning ? (
              <>
                <p>Guests will no longer see this store, post to it, or redeem its perks.</p>
                {actionError ? <Banner tone="error">{actionError}</Banner> : null}
                <Field id="store-ban-reason" label="Reason" error={reasonError}>
                  <textarea
                    id="store-ban-reason"
                    className="control"
                    rows={3}
                    maxLength={500}
                    value={reason}
                    autoFocus
                    onChange={(event) => setReason(event.target.value)}
                    aria-invalid={Boolean(reasonError)}
                    aria-describedby={describedBy('store-ban-reason', { error: reasonError })}
                  />
                </Field>
              </>
            ) : (
              <>
                <p>Guests will be able to see this store again.</p>
                {actionError ? <Banner tone="error">{actionError}</Banner> : null}
              </>
            )}
            <div className="dialog__actions">
              <button type="button" className="btn btn--quiet" onClick={closeDialog} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className={banning ? 'btn btn--danger' : 'btn btn--primary'}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? (banning ? 'Banning' : 'Restoring') : banning ? 'Ban this store' : 'Restore store'}
              </button>
            </div>
          </>
        ) : null}
      </Dialog>
    </Page>
  )
}
