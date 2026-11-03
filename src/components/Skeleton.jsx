function Bone({ className = '' }) {
  return <span className={`bone ${className}`.trim()} />
}

function Rows({ count }) {
  return Array.from({ length: count }, (_, index) => index)
}

export function ScoreSkeleton({ compact = false }) {
  return (
    <div className={compact ? 'score score--compact' : 'score'} aria-busy="true">
      <p className="sr">Loading post counts.</p>
      {['Photos', 'Videos'].map((title) => (
        <section className="score__col" key={title}>
          <h2>{title}</h2>
          <div className="score__pair">
            <p>
              <Bone className="bone--figure" />
              <Bone className="bone--label" />
            </p>
            <p>
              <Bone className="bone--figure" />
              <Bone className="bone--label" />
            </p>
          </div>
          <Bone className="bone--wait" />
        </section>
      ))}
    </div>
  )
}

export function FactsSkeleton() {
  return (
    <div className="facts" aria-hidden="true">
      <Bone className="bone--fact" />
      <Bone className="bone--fact" />
      <Bone className="bone--fact" />
    </div>
  )
}

export function StoreTableSkeleton({ rows = 5, caption = 'Loading stores' }) {
  return (
    <div className="table-wrap" aria-busy="true">
      <p className="sr">{caption}</p>
      <table className="register">
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
          {Rows({ count: rows }).map((row) => (
            <tr key={row}>
              <td>
                <Bone className="bone--name" />
                <Bone className="bone--meta" />
              </td>
              <td>
                <Bone className="bone--mail" />
              </td>
              <td>
                <Bone className="bone--tally" />
                <Bone className="bone--tally" />
              </td>
              <td>
                <Bone className="bone--tally" />
                <Bone className="bone--tally" />
              </td>
              <td>
                <Bone className="bone--date" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function UserTableSkeleton({ rows = 6 }) {
  return (
    <div className="table-wrap" aria-busy="true">
      <p className="sr">Loading users.</p>
      <table className="register">
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Role</th>
            <th scope="col">Joined</th>
            <th scope="col">Access</th>
          </tr>
        </thead>
        <tbody>
          {Rows({ count: rows }).map((row) => (
            <tr key={row}>
              <td>
                <Bone className="bone--name" />
                <Bone className="bone--meta" />
              </td>
              <td>
                <Bone className="bone--role" />
              </td>
              <td>
                <Bone className="bone--date" />
              </td>
              <td>
                <Bone className="bone--action" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
