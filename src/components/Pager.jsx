import { formatCount } from '../lib/format'

export function Pager({ offset, limit, total, onPage }) {
  if (!total) return null
  const from = offset + 1
  const to = Math.min(offset + limit, total)
  const pages = Math.ceil(total / limit)
  if (pages < 2) {
    return (
      <p className="pager__count">
        {formatCount(from)}–{formatCount(to)} of {formatCount(total)}
      </p>
    )
  }
  return (
    <div className="pager">
      <button
        type="button"
        className="btn btn--quiet"
        disabled={offset === 0}
        onClick={() => onPage(Math.max(0, offset - limit))}
      >
        Previous
      </button>
      <p className="pager__count">
        {formatCount(from)}–{formatCount(to)} of {formatCount(total)}
      </p>
      <button
        type="button"
        className="btn btn--quiet"
        disabled={offset + limit >= total}
        onClick={() => onPage(offset + limit)}
      >
        Next
      </button>
    </div>
  )
}
