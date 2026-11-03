import { formatCount, formatDate } from '../lib/format'

function Tally({ approved, rejected }) {
  return (
    <div className="tally">
      <span className="tally__ok">{formatCount(approved)} approved</span>
      <span className="tally__no">{formatCount(rejected)} rejected</span>
    </div>
  )
}

export function StoreTable({ items, caption = 'Onboarded stores' }) {
  return (
    <div className="table-wrap">
      <table className="register">
        <caption className="sr">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Owner</th>
            <th scope="col">Photos</th>
            <th scope="col">Videos</th>
            <th scope="col">Onboarded</th>
          </tr>
        </thead>
        <tbody>
          {items.map((store) => (
            <tr key={store.id}>
              <td>
                <span className="register__name">{store.name}</span>
                <span className="register__meta">
                  {[store.category, store.address].filter(Boolean).join(', ')}
                </span>
              </td>
              <td>
                <span className="register__name">{store.owner.email}</span>
                {store.owner.bannedAt ? (
                  <span className="register__meta register__meta--danger">Banned</span>
                ) : null}
              </td>
              <td>
                <Tally approved={store.media.approvedPhotos} rejected={store.media.rejectedPhotos} />
              </td>
              <td>
                <Tally approved={store.media.approvedVideos} rejected={store.media.rejectedVideos} />
              </td>
              <td>{formatDate(store.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
