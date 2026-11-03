import { useEffect, useRef, useState } from 'react'
import { Banner } from '../components/Banner'
import { Dialog } from '../components/Dialog'
import { Field } from '../components/Field'
import { describedBy } from '../lib/form'
import { Page } from '../components/Page'
import { Pager } from '../components/Pager'
import { UserTableSkeleton } from '../components/Skeleton'
import { useToast } from '../toast'
import { banUser, listUsers, unbanUser } from '../lib/api'
import { formatDate, roleLabel } from '../lib/format'

const LIMIT = 25
const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'banned', label: 'Banned' },
]

export function Users() {
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [offset, setOffset] = useState(0)
  const [version, setVersion] = useState(0)
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [pending, setPending] = useState(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    let live = true
    listUsers({ q, status, offset, limit: LIMIT }).then(
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
  }, [q, status, offset, version])

  function onSearch(value) {
    setDraft(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setState({ status: 'loading', data: null, error: null })
      setOffset(0)
      setQ(value.trim())
    }, 250)
  }

  function onFilter(next) {
    setState({ status: 'loading', data: null, error: null })
    setOffset(0)
    setStatus(next)
  }

  function onPage(next) {
    setState({ status: 'loading', data: null, error: null })
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
        await banUser(pending.user.id, reason.trim())
        toast(`Banned ${pending.user.email}`)
      } else {
        await unbanUser(pending.user.id)
        toast(`Restored access for ${pending.user.email}`)
      }
      setPending(null)
      setReason('')
      setReasonError('')
      setState({ status: 'loading', data: null, error: null })
      setVersion((value) => value + 1)
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
      title="Users"
      lede="Guests and store owners. Banning someone signs them out of the Hunt app and blocks the next login."
    >
      <form className="toolbar" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="search">
          <span>Search</span>
          <input
            className="control"
            value={draft}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Name or email"
          />
        </label>
      </form>
      <div className="filters" role="group" aria-label="Account status">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={status === filter.id}
            onClick={() => onFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {state.status === 'loading' ? <UserTableSkeleton /> : null}
      {state.status === 'error' ? <Banner tone="error">{state.error.message}</Banner> : null}
      {state.status === 'ready' && items.length ? (
        <>
          <div className="table-wrap">
            <table className="register">
              <caption className="sr">Guests and store owners</caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Access</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="register__name">{user.username || user.email}</span>
                      {user.username ? <span className="register__meta">{user.email}</span> : null}
                    </td>
                    <td>{roleLabel(user.role)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {user.bannedAt ? (
                        <>
                          <span className="register__name register__meta--danger">Banned</span>
                          {user.banReason ? <span className="register__meta">{user.banReason}</span> : null}
                          <button
                            type="button"
                            className="linkish linkish--good"
                            onClick={() => {
                              setActionError('')
                              setPending({ action: 'unban', user })
                            }}
                          >
                            Restore access
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="linkish"
                          onClick={() => {
                            setReason('')
                            setReasonError('')
                            setActionError('')
                            setPending({ action: 'ban', user })
                          }}
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager offset={state.data.offset} limit={state.data.limit} total={state.data.total} onPage={onPage} />
        </>
      ) : null}
      {state.status === 'ready' && !items.length ? (
        <p className="empty">{q || status !== 'all' ? 'No one matches.' : 'No guests or store owners yet.'}</p>
      ) : null}

      <Dialog open={Boolean(pending)} title={banning ? 'Ban this account' : 'Restore access'} onClose={closeDialog}>
        {pending ? (
          <>
            <p className="dialog__who">{pending.user.email}</p>
            {banning ? (
              <>
                <p>They will not be able to sign in. Stores they own stay on Hunt.</p>
                {actionError ? <Banner tone="error">{actionError}</Banner> : null}
                <Field id="ban-reason" label="Reason" error={reasonError}>
                  <textarea
                    id="ban-reason"
                    className="control"
                    rows={3}
                    maxLength={500}
                    value={reason}
                    autoFocus
                    onChange={(event) => setReason(event.target.value)}
                    aria-invalid={Boolean(reasonError)}
                    aria-describedby={describedBy('ban-reason', { error: reasonError })}
                  />
                </Field>
              </>
            ) : (
              <>
                <p>They will be able to sign in again.</p>
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
                {busy ? (banning ? 'Banning' : 'Restoring') : banning ? 'Ban this person' : 'Restore access'}
              </button>
            </div>
          </>
        ) : null}
      </Dialog>
    </Page>
  )
}
