import { formatCount, formatDate } from '../lib/format'

function Tally({ approved, rejected }) {
  return (
    <div className="tally">
      <span className="tally__ok">{formatCount(approved)} approved</span>
      <span className="tally__no">{formatCount(rejected)} rejected</span>
    </div>
  )
}

export function StoreTable({ items, caption = 'Onboarded stores', onBan, onUnban, promotions = false }) {
  const manage = Boolean(onBan && onUnban)

  return (
    <div className="table-wrap">
      <table className="register">
        <caption className="sr">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Owner</th>
            <th scope="col">Location</th>
            <th scope="col">Photos</th>
            <th scope="col">Videos</th>
            {promotions ? <th scope="col">Promotions</th> : null}
            <th scope="col">Last review</th>
            {manage ? <th scope="col">Access</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((store) => (
            <tr key={store.id}>
              <td>
                <span className="register__name">{store.name}</span>
                {store.category ? <span className="register__meta">{store.category}</span> : null}
                {store.bannedAt ? <span className="register__meta register__meta--danger">Banned</span> : null}
              </td>
              <td>
                <span className="register__name">{store.owner?.email}</span>
                {store.owner?.bannedAt ? (
                  <span className="register__meta register__meta--danger">Banned</span>
                ) : null}
              </td>
              <td>{store.address}</td>
              <td>
                <Tally approved={store.media.approvedPhotos} rejected={store.media.rejectedPhotos} />
              </td>
              <td>
                <Tally approved={store.media.approvedVideos} rejected={store.media.rejectedVideos} />
              </td>
              {promotions ? <td className="register__count">{formatCount(store.promotions)}</td> : null}
              <td>{store.lastReviewedAt ? formatDate(store.lastReviewedAt) : 'None yet'}</td>
              {manage ? (
                <td>
                  {store.bannedAt ? (
                    <>
                      {store.banReason ? <span className="register__meta">{store.banReason}</span> : null}
                      <button type="button" className="linkish linkish--good" onClick={() => onUnban(store)}>
                        Restore store
                      </button>
                    </>
                  ) : (
                    <button type="button" className="linkish" onClick={() => onBan(store)}>
                      Ban
                    </button>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
