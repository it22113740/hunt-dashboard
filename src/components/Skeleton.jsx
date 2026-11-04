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

export function StoreTableSkeleton({ rows = 5, caption = 'Loading stores', actions = false, promotions = false }) {
  return (
    <div className="table-wrap" aria-busy="true">
      <p className="sr">{caption}</p>
      <table className="register">
        <thead>
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Owner</th>
            <th scope="col">Location</th>
            <th scope="col">Photos</th>
            <th scope="col">Videos</th>
            {promotions ? <th scope="col">Promotions</th> : null}
            <th scope="col">Last review</th>
            {actions ? <th scope="col">Access</th> : null}
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
                <Bone className="bone--meta" />
              </td>
              <td>
                <Bone className="bone--tally" />
                <Bone className="bone--tally" />
              </td>
              <td>
                <Bone className="bone--tally" />
                <Bone className="bone--tally" />
              </td>
              {promotions ? (
                <td>
                  <Bone className="bone--tally" />
                </td>
              ) : null}
              <td>
                <Bone className="bone--date" />
              </td>
              {actions ? (
                <td>
                  <Bone className="bone--action" />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function OwnerTableSkeleton({ rows = 6 }) {
  return (
    <div className="table-wrap" aria-busy="true">
      <p className="sr">Loading store owners.</p>
      <table className="register">
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Stores</th>
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
                <Bone className="bone--tally" />
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

export function UserTableSkeleton({ rows = 6 }) {
  return (
    <div className="table-wrap" aria-busy="true">
      <p className="sr">Loading creators.</p>
      <table className="register">
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Joined</th>
            <th scope="col">Perks redeemed</th>
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
                <Bone className="bone--date" />
              </td>
              <td>
                <Bone className="bone--tally" />
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
